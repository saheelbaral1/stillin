// src/app/api/board/route.ts
//
// GET /api/board → TeamStatus[]
//
// Returns the live qualification status of the most-followed teams
// (FEATURED_TEAMS) for the homepage "big names" board. Like /api/status, this
// route NEVER calls football-data.org directly — it reads the latest snapshot
// from `standings_cache`, so a slow upstream API can only ever make the board
// slightly stale, never hang.
//
// Unlike /api/status it never errors on missing data: when the cache is empty
// or stale it returns an empty array so the client can keep rendering the static
// team rows and simply skip the live pills.

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getTeamStatus } from "@/lib/qualification";
import type { TeamStatus } from "@/lib/qualification";
import type { GroupStandings } from "@/lib/balldontlie";
import { TEAMS, FEATURED_TEAMS, getTeamByName } from "@/lib/teams";

// Match the staleness window used by /api/status (Section 9: 10 minutes).
const MAX_CACHE_AGE_MS = 10 * 60 * 1000;

export async function GET(): Promise<NextResponse> {
  try {
    // Most recent standings snapshot written by /api/cron/refresh.
    const { data: rows, error: dbError } = await supabaseServer
      .from("standings_cache")
      .select("data, fetched_at")
      .order("fetched_at", { ascending: false })
      .limit(1);

    if (dbError) throw new Error(`Supabase read failed: ${dbError.message}`);

    // No data yet or stale → empty board, never an error (client falls back).
    if (!rows || rows.length === 0) return NextResponse.json([]);

    const row = rows[0];
    const ageMs = Date.now() - new Date(row.fetched_at as string).getTime();
    if (ageMs > MAX_CACHE_AGE_MS) return NextResponse.json([]);

    const standings = row.data as GroupStandings[];

    // Compute each featured team's status. getTeamStatus throws if a team isn't
    // in the standings yet — skip those rather than failing the whole board.
    const statuses: TeamStatus[] = [];
    for (const name of FEATURED_TEAMS) {
      try {
        const status = getTeamStatus(name, standings, TEAMS);
        // Same flag fallback as /api/status: resolve via alias table if blank.
        if (!status.flag) {
          const resolved = getTeamByName(status.team) ?? getTeamByName(name);
          if (resolved) status.flag = resolved.flag;
        }
        statuses.push(status);
      } catch {
        // Team not in standings yet — omit it from the board.
      }
    }

    return NextResponse.json(statuses);
  } catch {
    // Always degrade gracefully to an empty board.
    return NextResponse.json([]);
  }
}
