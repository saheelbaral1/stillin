// src/lib/supabase.ts
//
// Browser-safe Supabase client. Uses only the public, NEXT_PUBLIC_-prefixed
// values (Section 5 of STILLIN_MASTER.md): the project URL and the anon key.
// The anon key is designed to be exposed to the browser — Row Level Security on
// the database is what actually protects the data, not key secrecy.
//
// Safe to import from client components. For privileged server-side writes
// (e.g. the cron job), use `supabase-server.ts` instead.

import { createClient } from "@supabase/supabase-js";

// Read the public connection values. These are inlined into the browser bundle
// by Next.js at build time because of the NEXT_PUBLIC_ prefix, so they must
// never hold a secret.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail loudly at module load if the public env vars are missing, rather than
// letting createClient throw a vaguer error deep inside a request.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.",
  );
}

// Shared anon client for the whole app's client-side / public-read usage.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
