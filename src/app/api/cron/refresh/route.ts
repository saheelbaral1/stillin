// src/app/api/cron/refresh/route.ts
//
// Called by Vercel Cron every minute per vercel.json:
//   { "crons": [{ "path": "/api/cron/refresh", "schedule": "* * * * *" }] }
//
// This is the only place that talks directly to the BallDontLie API. Everything
// else in the app reads from the `standings_cache` table that this route writes.
//
// Steps (Section 9 of STILLIN_MASTER.md):
//   1. Fetch current group standings from BallDontLie.
//   2. Fetch live games to determine is_live flag.
//   3. Write a new row to `standings_cache` in Supabase.
//   4. [TODO] Check notifications and send emails via Resend.
//   5. Return { ok, isLive, timestamp }.
//
// SECURITY FLAG: Section 9 requires a CRON_SECRET header check in production,
// but CRON_SECRET is not listed in Section 5's env var list. Add it to
// STILLIN_MASTER.md Section 5 and to .env.local before deploying.

import { NextRequest, NextResponse } from "next/server";
import { fetchStandings, fetchLiveMatches } from "@/lib/balldontlie";
import { supabaseServer } from "@/lib/supabase-server";

// Vercel attaches this header automatically when invoking a cron route, so
// checking it blocks arbitrary external callers without any client-side secret.
// See: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest): Promise<NextResponse> {
  // --- Auth: block non-Vercel callers in production ---
  // Only enforce when CRON_SECRET is set so local dev still works without it.
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 1. Fetch current group standings from BallDontLie (throws on failure).
    const standings = await fetchStandings();

    // 2. Fetch live games to determine whether any match is currently in
    //    progress. The is_live flag lets the UI know it should poll aggressively.
    const liveMatches = await fetchLiveMatches();
    const isLive = liveMatches.length > 0;

    // 3. Write a new cache row to Supabase. We store the full standings array as
    //    JSON so /api/status can deserialise it without another BallDontLie call.
    //    `fetched_at` defaults to now() per the DB schema (Section 8).
    const { error: insertError } = await supabaseServer
      .from("standings_cache")
      .insert({ data: standings, is_live: isLive });

    if (insertError) {
      throw new Error(`Supabase insert failed: ${insertError.message}`);
    }

    // TODO: check notifications table and send emails via Resend
    // (Step 4 from Section 9 — deferred until /api/notify and Resend are wired up)

    return NextResponse.json({
      ok: true,
      isLive,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
