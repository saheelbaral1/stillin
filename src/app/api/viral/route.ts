// src/app/api/viral/route.ts
//
// GET /api/viral → ViralPost[]
//
// Reads the latest row from viral_cache (written by /api/cron/refresh every
// 30 minutes). Returns an empty array — never an error — when the cache hasn't
// been seeded yet so the client can fall back gracefully to static content.

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import type { ViralPost } from "@/lib/balldontlie";

export async function GET(): Promise<NextResponse> {
  try {
    const { data: rows, error } = await supabaseServer
      .from("viral_cache")
      .select("posts")
      .order("fetched_at", { ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);

    const posts = (rows?.[0]?.posts as ViralPost[] | undefined) ?? [];
    return NextResponse.json(posts);
  } catch {
    // Always return 200 with empty array — client falls back to static moments.
    return NextResponse.json([]);
  }
}
