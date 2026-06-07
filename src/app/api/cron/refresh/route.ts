// src/app/api/cron/refresh/route.ts
//
// Called by Vercel Cron every minute per vercel.json.
// Steps:
//   1. Fetch current group standings from football-data.org.
//   2. Fetch live games → set is_live flag.
//   3. Write new row to standings_cache.
//   4. If viral_cache is older than 30 min, fetch Reddit + assign emojis via Groq.
//   5. Return { ok, isLive, timestamp }.

import { NextRequest, NextResponse } from "next/server";
import { fetchStandings, fetchLiveMatches } from "@/lib/balldontlie";
import type { ViralPost } from "@/lib/balldontlie";
import { supabaseServer } from "@/lib/supabase-server";

const CRON_SECRET = process.env.CRON_SECRET;
const REDDIT_TIMEOUT_MS = 8_000;
const GROQ_TIMEOUT_MS   = 10_000;
const VIRAL_REFRESH_INTERVAL_MS = 30 * 60 * 1000;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";

type GroqResponse = { choices: Array<{ message: { content: string } }> };

// Sends all Reddit post titles to Groq in one call and gets back one emoji per
// title. Groq is far better than keyword matching at picking the right emoji —
// it understands context, culture, and tone. Falls back to ⚽ per post if Groq
// is unavailable or returns an unparseable response.
async function assignEmojis(titles: string[]): Promise<string[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || titles.length === 0) return titles.map(() => "⚽");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You pick one emoji per World Cup news headline. " +
              "Choose the emoji that best captures the story's vibe — be creative and fun, not literal. " +
              "Return ONLY a valid JSON array of emoji strings, one per headline, in the same order. " +
              "No text, no explanation, no markdown — just the raw JSON array.",
          },
          {
            role: "user",
            content: JSON.stringify(titles),
          },
        ],
        max_tokens: 150,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!res.ok) return titles.map(() => "⚽");

    const data = (await res.json()) as GroqResponse;
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "[]";

    // Strip markdown code fences if Groq wraps the JSON
    const cleaned = raw.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "").trim();
    const emojis = JSON.parse(cleaned) as string[];

    return titles.map((_, i) => (typeof emojis[i] === "string" ? emojis[i] : "⚽"));
  } catch {
    return titles.map(() => "⚽");
  } finally {
    clearTimeout(timeout);
  }
}

type RedditChild = {
  data: {
    title: string;
    score: number;
    permalink: string;
    created_utc: number;
  };
};
type RedditJson = { data: { children: RedditChild[] } };

// Fetches hot posts from r/worldcup+soccer, filters low-quality posts, lets
// Groq pick the emoji for each title, and returns up to 8 ViralPost objects.
async function fetchRedditPosts(): Promise<ViralPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT_MS);

  let filtered: RedditChild["data"][];
  try {
    const res = await fetch(
      "https://www.reddit.com/r/worldcup+soccer/hot.json?limit=30",
      {
        headers: { "User-Agent": "stillin-app/1.0 (World Cup tracker)" },
        signal: controller.signal,
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);

    const json = (await res.json()) as RedditJson;
    const sevenDaysAgo = Date.now() / 1000 - 7 * 86400;

    filtered = json.data.children
      .map((c) => c.data)
      .filter(
        (p) =>
          p.score > 50 &&
          p.created_utc > sevenDaysAgo &&
          !p.title.startsWith("[removed]") &&
          !p.title.startsWith("[deleted]")
      )
      .slice(0, 8);
  } finally {
    clearTimeout(timeout);
  }

  if (filtered.length === 0) return [];

  // One Groq call assigns all emojis in parallel with the post metadata build.
  const titles = filtered.map((p) => p.title);
  const emojis = await assignEmojis(titles);

  return filtered.map((p, i) => ({
    emoji:    emojis[i],
    headline: p.title.length > 28 ? p.title.slice(0, 28).trimEnd() + "…" : p.title,
    sub:      p.title.length > 90 ? p.title.slice(0, 90).trimEnd() + "…" : p.title,
    score:    p.score,
    url:      `https://reddit.com${p.permalink}`,
  }));
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 1 & 2. Standings + live match check.
    const standings = await fetchStandings();
    const liveMatches = await fetchLiveMatches();
    const isLive = liveMatches.length > 0;

    // 3. Write standings cache.
    const { error: insertError } = await supabaseServer
      .from("standings_cache")
      .insert({ data: standings, is_live: isLive });

    if (insertError) {
      throw new Error(`Supabase insert failed: ${insertError.message}`);
    }

    // 4. Refresh viral cache if older than 30 minutes.
    const { data: viralRows } = await supabaseServer
      .from("viral_cache")
      .select("fetched_at")
      .order("fetched_at", { ascending: false })
      .limit(1);

    const lastFetch = viralRows?.[0]?.fetched_at
      ? new Date(viralRows[0].fetched_at as string).getTime()
      : 0;

    if (Date.now() - lastFetch > VIRAL_REFRESH_INTERVAL_MS) {
      try {
        const posts = await fetchRedditPosts();
        if (posts.length > 0) {
          await supabaseServer.from("viral_cache").insert({ posts });
        }
      } catch {
        // Non-fatal — standings already written, viral refresh is best-effort.
      }
    }

    // TODO: check notifications and send emails via Resend (Step 4, Section 9)

    return NextResponse.json({ ok: true, isLive, timestamp: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
