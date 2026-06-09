// src/app/api/cron/refresh/route.ts
//
// Called by Vercel Cron every minute per vercel.json.
// Steps:
//   1. Fetch current group standings from football-data.org.
//   2. Fetch live games → set is_live flag.
//   3. Write new row to standings_cache.
//   4. If viral_cache is older than 30 min, fetch Google News + assign emojis via Groq.
//   5. Return { ok, isLive, timestamp }.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { fetchStandings, fetchLiveMatches } from "@/lib/balldontlie";
import type { ViralPost, GroupStandings } from "@/lib/balldontlie";
import { supabaseServer } from "@/lib/supabase-server";
import { getTeamStatus } from "@/lib/qualification";
import { TEAMS } from "@/lib/teams";
import { buildEmailHtml } from "@/lib/email-templates";

// Switch to "still in? <noreply@stillin.app>" once the domain is verified in Resend.
const RESEND_FROM = "still in? <onboarding@resend.dev>";

const CRON_SECRET = process.env.CRON_SECRET;
const NEWS_TIMEOUT_MS = 8_000;
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

// Google News RSS: free, no API key, no auth, and (unlike Reddit) it serves
// datacenter IPs like Vercel's functions. The feed returns fresh, relevant
// World Cup 2026 headlines from real outlets, newest first.
const NEWS_RSS_URL =
  "https://news.google.com/rss/search?q=World+Cup+2026+when:7d&hl=en-US&gl=US&ceid=US:en";

type NewsItem = { title: string; link: string };

// Decodes the handful of XML/HTML entities Google News emits in titles.
function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .trim();
}

// Parses <item> blocks out of the RSS XML without an XML dependency. Google News
// titles arrive as "Headline - Source"; we keep the source out of the headline
// but leave the full string in `sub` so the row still reads naturally.
function parseRssItems(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/g;
  const titleRe = /<title>([\s\S]*?)<\/title>/;
  const linkRe  = /<link>([\s\S]*?)<\/link>/;

  for (const block of xml.match(itemRe) ?? []) {
    const title = titleRe.exec(block)?.[1];
    const link  = linkRe.exec(block)?.[1];
    if (title && link) {
      items.push({ title: decodeEntities(title), link: decodeEntities(link) });
    }
  }
  return items;
}

// Fetches the latest World Cup headlines from Google News, lets Groq pick an
// emoji for each, and returns up to 8 ViralPost objects. News has no engagement
// metric, so `score` is left undefined (the UI shows an arrow instead).
async function fetchNewsPosts(): Promise<ViralPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NEWS_TIMEOUT_MS);

  let items: NewsItem[];
  try {
    const res = await fetch(NEWS_RSS_URL, {
      headers: { "User-Agent": "stillin-app/1.0 (World Cup tracker)" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Google News HTTP ${res.status}`);

    items = parseRssItems(await res.text()).slice(0, 8);
  } finally {
    clearTimeout(timeout);
  }

  if (items.length === 0) return [];

  // The clean headline drops the trailing " - Source" Google News appends.
  const cleanTitle = (t: string) => t.replace(/\s+-\s+[^-]+$/, "").trim();

  const titles = items.map((it) => cleanTitle(it.title));
  const emojis = await assignEmojis(titles);

  return items.map((it, i) => {
    const headline = titles[i];
    return {
      emoji:    emojis[i],
      headline: headline.length > 28 ? headline.slice(0, 28).trimEnd() + "…" : headline,
      sub:      headline.length > 90 ? headline.slice(0, 90).trimEnd() + "…" : headline,
      url:      it.link,
    };
  });
}

// Shape of a row from the notifications table that we need here.
type NotifRow = { id: string; email: string; team: string };

// Reads every unnotified subscription, checks the fresh standings, and emails
// any subscriber whose team has reached a final state (THROUGH or OUT). Marks
// each row notified — even on email send failure — to prevent re-sending every
// minute. Entirely non-fatal: errors inside are caught so the cron is never
// blocked by a Resend outage or a bad subscriber address.
async function checkAndNotify(standings: GroupStandings[]): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("RESEND_API_KEY not set — skipping notification emails");
    return;
  }

  // Fetch all subscriptions that haven't been notified yet.
  const { data: rows, error: fetchError } = await supabaseServer
    .from("notifications")
    .select("id, email, team")
    .eq("notified", false);

  if (fetchError) {
    console.warn("Failed to read notifications:", fetchError.message);
    return;
  }
  if (!rows || rows.length === 0) return;

  const notifRows = rows as NotifRow[];

  // De-duplicate teams so we call getTeamStatus at most once per team.
  const uniqueTeams = [...new Set(notifRows.map((r) => r.team))];
  const resend = new Resend(resendKey);

  for (const teamName of uniqueTeams) {
    let status;
    try {
      status = getTeamStatus(teamName, standings, TEAMS);
    } catch {
      continue; // Team not in standings yet — skip silently.
    }

    // Only notify when status is genuinely final and matches have been played.
    // matchesPlayed === 0 guard prevents pre-tournament false positives.
    if (
      (status.status !== "THROUGH" && status.status !== "OUT") ||
      status.matchesPlayed === 0
    ) {
      continue;
    }

    const qualifier =
      status.status === "THROUGH"
        ? "qualified for the Round of 32"
        : "been eliminated from the World Cup";
    const subject = `${status.flag} ${teamName} are ${status.status === "THROUGH" ? "THROUGH" : "OUT"} — World Cup 2026`;
    const ctaUrl = `https://stillin.vercel.app/?team=${encodeURIComponent(teamName)}`;
    const plainText =
      `You asked us to let you know. ${teamName} have ${qualifier}. ` +
      `See the full picture: ${ctaUrl} — still in? · for people who are half-watching.`;

    // Email each subscriber for this team, then mark the row notified.
    for (const row of notifRows.filter((r) => r.team === teamName)) {
      try {
        await resend.emails.send({
          from: RESEND_FROM,
          to: row.email,
          subject,
          html: buildEmailHtml({
            type: "status",
            team: teamName,
            flag: status.flag,
            status: status.status,
            message: status.message,
            ctaUrl,
          }),
          text: plainText,
        });
      } catch (emailErr) {
        console.warn(
          `Notification email to ${row.email} failed:`,
          emailErr instanceof Error ? emailErr.message : emailErr,
        );
      }

      // Mark notified regardless of email success — prevents re-sending every
      // minute if the address is invalid or Resend is temporarily rate-limiting.
      try {
        await supabaseServer
          .from("notifications")
          .update({ notified: true })
          .eq("email", row.email)
          .eq("team", row.team);
      } catch (dbErr) {
        console.warn(
          `Failed to mark notified for ${row.email} / ${row.team}:`,
          dbErr instanceof Error ? dbErr.message : dbErr,
        );
      }
    }
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

    // 4. Refresh viral cache (latest news headlines) if older than 30 minutes.
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
        const posts = await fetchNewsPosts();
        if (posts.length > 0) {
          await supabaseServer.from("viral_cache").insert({ posts });
        }
      } catch {
        // Non-fatal — standings already written, viral refresh is best-effort.
      }
    }

    // 5. Check notification subscriptions and fire status-change emails.
    try {
      await checkAndNotify(standings);
    } catch {
      // Non-fatal — notification failures never block the cron response.
    }

    return NextResponse.json({ ok: true, isLive, timestamp: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
