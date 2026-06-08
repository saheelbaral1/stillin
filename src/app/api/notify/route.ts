// src/app/api/notify/route.ts
//
// POST /api/notify
// Body: { email: string, team: string }
//
// Saves an email address to the `notifications` table so the user can be
// alerted when their team's qualification status is decided (THROUGH or OUT).
// Duplicates are silently accepted — idempotent so double-taps from the UI
// never cause an error or a duplicate row.
//
// Per Section 9 of STILLIN_MASTER.md.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase-server";

// Switch to "still in? <noreply@stillin.app>" once the domain is verified in Resend.
const RESEND_FROM = "still in? <onboarding@resend.dev>";

// RFC 5322-lite: good enough to catch obvious typos without a dependency.
// Intentionally simple — we don't need perfect validation, just a sanity check.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // --- Parse and validate the request body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    !("team" in body)
  ) {
    return NextResponse.json(
      { error: "Missing required fields: email, team" },
      { status: 400 },
    );
  }

  const { email, team } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json(
      { error: "Missing required field: email" },
      { status: 400 },
    );
  }

  if (typeof team !== "string" || !team.trim()) {
    return NextResponse.json(
      { error: "Missing required field: team" },
      { status: 400 },
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanTeam = team.trim();

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  try {
    // --- Check for duplicate: same email + team already subscribed ---
    // Return 200 silently rather than 409 so the UI can treat any successful
    // POST as "you're signed up" without special-casing the duplicate state.
    const { data: existing, error: selectError } = await supabaseServer
      .from("notifications")
      .select("id")
      .eq("email", cleanEmail)
      .eq("team", cleanTeam)
      .limit(1);

    if (selectError) {
      throw new Error(`Supabase read failed: ${selectError.message}`);
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    // --- Insert the new notification subscription ---
    const { error: insertError } = await supabaseServer
      .from("notifications")
      .insert({ email: cleanEmail, team: cleanTeam });

    if (insertError) {
      throw new Error(`Supabase insert failed: ${insertError.message}`);
    }

    // Send a confirmation email. Non-fatal — a Resend failure must never cause
    // the subscription itself to fail. If the key is absent, warn and skip.
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set — skipping confirmation email");
    } else {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: RESEND_FROM,
          to: cleanEmail,
          subject: "You're on the list 🏆",
          text:
            `Hey — we've got you. We'll email you the moment ${cleanTeam}'s fate is decided ` +
            `at the World Cup 2026. Until then, check the live tracker anytime at ` +
            `https://stillin.vercel.app/?team=${encodeURIComponent(cleanTeam)} ` +
            `— still in? · for people who are half-watching.`,
        });
      } catch (emailErr) {
        console.warn(
          "Confirmation email failed:",
          emailErr instanceof Error ? emailErr.message : emailErr,
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
