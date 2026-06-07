// src/app/api/cron/refresh/route.ts
//
// Called by Vercel Cron every minute per vercel.json.
// Steps:
//   1. Fetch current group standings from football-data.org.
//   2. Fetch live games → set is_live flag.
//   3. Write new row to standings_cache.
//   4. If viral_cache is older than 30 min, fetch Reddit and refresh it.
//   5. Return { ok, isLive, timestamp }.

import { NextRequest, NextResponse } from "next/server";
import { fetchStandings, fetchLiveMatches } from "@/lib/balldontlie";
import type { ViralPost } from "@/lib/balldontlie";
import { supabaseServer } from "@/lib/supabase-server";

const CRON_SECRET = process.env.CRON_SECRET;
const REDDIT_TIMEOUT_MS = 8_000;
const VIRAL_REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// Keyword → emoji map for deriving a visual from Reddit post titles.
const EMOJI_MAP: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ["viking", "warrior", "costume", "dressed"],  emoji: "🪖" },
  { keywords: ["plane", "flight", "airport", "bless"],      emoji: "✈️" },
  { keywords: ["haka", "new zealand"],                      emoji: "🌊" },
  { keywords: ["penalty", "shoot-out"],                     emoji: "🎯" },
  { keywords: ["red card", "var", "sent off"],              emoji: "🚨" },
  { keywords: ["celebrate", "dance", "party", "ritual"],    emoji: "🎉" },
  { keywords: ["stadium", "arena", "atmosphere"],           emoji: "🏟️" },
  { keywords: ["kit", "jersey", "shirt", "uniform"],        emoji: "👕" },
  { keywords: ["fan", "supporter", "crowd", "ultras"],      emoji: "🙌" },
  { keywords: ["manager", "coach", "tactical"],             emoji: "🧑‍💼" },
  { keywords: ["goal", "hat-trick", "scored"],              emoji: "⚽" },
];

function deriveEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const { keywords, emoji } of EMOJI_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return emoji;
  }
  return "⚽";
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

// Fetches hot posts from r/worldcup+soccer, filters low-quality posts, and
// returns up to 8 ViralPost objects. Reddit's unauthenticated JSON endpoint
// works without any API key — just a User-Agent header is required.
async function fetchRedditPosts(): Promise<ViralPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT_MS);

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

    return json.data.children
      .map((c) => c.data)
      .filter(
        (p) =>
          p.score > 50 &&
          p.created_utc > sevenDaysAgo &&
          !p.title.startsWith("[removed]") &&
          !p.title.startsWith("[deleted]")
      )
      .slice(0, 8)
      .map((p) => ({
        emoji:    deriveEmoji(p.title),
        headline: p.title.length > 28 ? p.title.slice(0, 28).trimEnd() + "…" : p.title,
        sub:      p.title.length > 90 ? p.title.slice(0, 90).trimEnd() + "…" : p.title,
        score:    p.score,
        url:      `https://reddit.com${p.permalink}`,
      }));
  } finally {
    clearTimeout(timeout);
  }
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
