// src/app/api/status/route.ts
//
// GET /api/status?team=Brazil → TeamStatus
//
// This route NEVER calls BallDontLie directly. It always reads from the
// `standings_cache` table written by /api/cron/refresh. This separation means
// a slow or down BallDontLie API can never make the user-facing status page hang
// — the worst case is slightly stale data, surfaced via the 503 staleness check.
//
// Per Section 9 of STILLIN_MASTER.md:
//   - 503 if cache is missing or older than 10 minutes
//   - 400 if team is not found (task spec; Section 9 says 404 — flagged)
//   - 200 with full TeamStatus object on success
//   - 500 on any unexpected error

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getTeamStatus } from "@/lib/qualification";
import type { GroupStandings } from "@/lib/balldontlie";
import { TEAMS } from "@/lib/teams";

// How old the cache can be before we refuse to serve it. Section 9: 10 minutes.
const MAX_CACHE_AGE_MS = 10 * 60 * 1000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  // --- 1. Read and validate the team query param ---
  const { searchParams } = request.nextUrl;
  const teamName = searchParams.get("team")?.trim();

  if (!teamName) {
    return NextResponse.json(
      { error: "Missing required query parameter: team" },
      { status: 400 },
    );
  }

  try {
    // --- 2. Fetch the most recent cache row from Supabase ---
    const { data: rows, error: dbError } = await supabaseServer
      .from("standings_cache")
      .select("data, fetched_at")
      .order("fetched_at", { ascending: false })
      .limit(1);

    if (dbError) {
      throw new Error(`Supabase read failed: ${dbError.message}`);
    }

    // --- 3. Reject if cache is empty or stale ---
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "No data available yet" },
        { status: 503 },
      );
    }

    const row = rows[0];
    const fetchedAt = new Date(row.fetched_at as string).getTime();
    const ageMs = Date.now() - fetchedAt;

    if (ageMs > MAX_CACHE_AGE_MS) {
      return NextResponse.json(
        { error: "No data available yet" },
        { status: 503 },
      );
    }

    // --- 4. Parse cached standings and compute the team's status ---
    // The `data` column stores the full GroupStandings[] array written by the
    // cron route. Supabase returns jsonb as a plain JS value, so we cast it.
    const standings = row.data as GroupStandings[];

    const status = getTeamStatus(teamName, standings, TEAMS);

    // --- 6. Return the full TeamStatus object ---
    return NextResponse.json(status);
  } catch (error) {
    if (!(error instanceof Error)) {
      return NextResponse.json(
        { error: "Unexpected error" },
        { status: 500 },
      );
    }

    // --- 5. Team not found: getTeamStatus throws with "was not found" ---
    if (error.message.includes("was not found")) {
      return NextResponse.json({ error: "Team not found" }, { status: 400 });
    }

    // --- 7. Any other error is a 500 ---
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
