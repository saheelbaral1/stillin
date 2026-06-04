// src/lib/supabase-server.ts
//
// ⚠️ SERVER ONLY — NEVER IMPORT THIS FILE FROM A CLIENT COMPONENT. ⚠️
//
// This client is built with SUPABASE_SERVICE_ROLE_KEY, which bypasses Row Level
// Security and has full read/write access to the database (Section 5 of
// STILLIN_MASTER.md). If it ever reached the browser bundle, anyone could read
// and modify every table. Import it only from route handlers / server code
// (e.g. /api/cron/refresh, /api/notify). For client components use
// `supabase.ts` (the anon client) instead.

import { createClient } from "@supabase/supabase-js";

// The project URL is public (NEXT_PUBLIC_), but the service-role key is a
// server secret with no NEXT_PUBLIC_ prefix, so Next.js will not expose it to
// the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail loudly at module load if the required server env vars are missing.
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.",
  );
}

// Privileged client for trusted server-side writes (cache refresh, notify, etc).
// Disable auth session persistence: this runs in stateless server contexts with
// no user session to store, and persisting one would be meaningless here.
export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
