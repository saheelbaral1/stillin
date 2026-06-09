// src/app/api/cron/refresh/route.ts
//
// Called by Vercel Cron every minute per vercel.json.
// Steps:
//   1. Fetch current group standings from football-data.org.
//   2. Fetch live games → set is_live flag.
//   3. Write new row to standings_cache.
//   4. Check notification subscriptions → email teams that hit a final state.
//   5. Return { ok, isLive, timestamp }.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { fetchStandings, fetchLiveMatches } from "@/lib/balldontlie";
import type { GroupStandings } from "@/lib/balldontlie";
import { supabaseServer } from "@/lib/supabase-server";
import { getTeamStatus } from "@/lib/qualification";
import { TEAMS } from "@/lib/teams";
import { buildEmailHtml } from "@/lib/email-templates";

// Switch to "still in? <noreply@stillin.app>" once the domain is verified in Resend.
const RESEND_FROM = "still in? <onboarding@resend.dev>";

const CRON_SECRET = process.env.CRON_SECRET;

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

    // 4. Check notification subscriptions and fire status-change emails.
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
