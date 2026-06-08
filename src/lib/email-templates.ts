// src/lib/email-templates.ts
//
// Generates HTML email bodies for the still in? notification system.
// Rules for email HTML:
//   - Inline styles only — no external CSS, no <style> blocks (stripped by Gmail).
//   - No web fonts — email clients don't load Google Fonts. System font stack only.
//   - rgba() border is used as spec'd; Outlook on Windows will ignore it (acceptable).
//   - Both email types share the same outer wrapper, wordmark, and footer so the
//     brand is consistent across confirmation and status notification emails.

// Maps internal status codes to display labels shown in the status email.
const STATUS_LABELS: Record<string, string> = {
  THROUGH:    "THROUGH",
  HANGING_ON: "HANGING ON",
  IN_DANGER:  "IN DANGER",
  OUT:        "OUT",
};

// Status label colours per the email design spec.
const STATUS_COLORS: Record<string, string> = {
  THROUGH:    "#4ADE80",
  HANGING_ON: "#FCD34D",
  IN_DANGER:  "#F87171",
  OUT:        "#6B7280",
};

// System font stack used on every text element — web fonts are not loaded by
// email clients so we fall back to the best native option on each platform.
const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif`;

// Minimal HTML escaping for user-supplied strings inserted into the template.
// Only characters that break HTML structure need escaping in element content;
// the apostrophe is safe in HTML body text and does not need &apos;.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type EmailParams =
  | {
      type: "confirmation";
      team: string;
      flag: string;
      ctaUrl: string;
    }
  | {
      type: "status";
      team: string;
      flag: string;
      status: "THROUGH" | "HANGING_ON" | "IN_DANGER" | "OUT";
      message: string;
      ctaUrl: string;
    };

// Builds the card inner HTML — differs between confirmation and status emails.
function buildCardContent(params: EmailParams): string {
  if (params.type === "confirmation") {
    return `
      <div style="font-size:48px;text-align:center;margin-bottom:8px;line-height:1.2;">${params.flag}</div>
      <p style="margin:0 0 24px 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#888888;text-align:center;font-family:${FONT};">${esc(params.team)}</p>
      <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#FFFFFF;text-align:center;font-family:${FONT};">We've got you.</h1>
      <p style="margin:0 0 28px 0;font-size:15px;color:#AAAAAA;text-align:center;line-height:1.6;font-family:${FONT};">We'll email you the moment ${esc(params.team)}'s fate is decided at the World Cup 2026.</p>
      <div style="text-align:center;">
        <a href="${esc(params.ctaUrl)}" style="background:#C9A84C;color:#000000;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-family:${FONT};">Check live status &rarr;</a>
      </div>
    `;
  }

  // Status notification card.
  const label = STATUS_LABELS[params.status] ?? params.status;
  const color = STATUS_COLORS[params.status] ?? "#FFFFFF";

  return `
    <div style="font-size:64px;text-align:center;margin-bottom:8px;line-height:1.2;">${params.flag}</div>
    <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#888888;text-align:center;font-family:${FONT};">${esc(params.team)}</p>
    <p style="margin:16px 0;font-size:36px;font-weight:900;color:${color};text-align:center;letter-spacing:-0.02em;font-family:${FONT};">${label}</p>
    <p style="margin:0 0 28px 0;font-size:15px;color:#AAAAAA;text-align:center;line-height:1.6;font-family:${FONT};">${esc(params.message)}</p>
    <div style="text-align:center;">
      <a href="${esc(params.ctaUrl)}" style="background:#C9A84C;color:#000000;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-family:${FONT};">See the full picture &rarr;</a>
    </div>
  `;
}

// Returns a full HTML email string for the given params. Call this once per
// send — both routes share this function so the visual brand is always in sync.
export function buildEmailHtml(params: EmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>still in?</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;">
  <div style="background:#0A0A0A;padding:40px 20px;font-family:${FONT};">
    <div style="max-width:480px;margin:0 auto;">

      <p style="margin:0 0 32px 0;font-size:14px;letter-spacing:0.05em;color:#C9A84C;text-align:center;font-family:${FONT};">still in?</p>

      <div style="background:#111111;border:1px solid rgba(201,168,76,0.4);border-radius:12px;padding:32px 28px;">
        ${buildCardContent(params)}
      </div>

      <p style="margin:24px 0 8px 0;font-size:11px;color:#333333;text-align:center;font-family:${FONT};">still in? &middot; for people who are half-watching</p>
      <p style="margin:0;font-size:11px;color:#333333;text-align:center;font-family:${FONT};">
        <a href="https://stillin.vercel.app/unsubscribe" style="color:#333333;text-decoration:underline;">Unsubscribe</a>
      </p>

    </div>
  </div>
</body>
</html>`;
}
