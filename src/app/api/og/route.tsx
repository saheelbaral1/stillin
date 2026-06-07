/* Generates dynamic OG share images for each team + status combination using next/og.
   Called by social platforms when a stillin.vercel.app link is shared. */
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getTeamByName } from '@/lib/teams';

type Status = 'THROUGH' | 'HANGING_ON' | 'IN_DANGER' | 'OUT';

interface StateConfig {
  statusColor: string;
  glowColor: string | null;
  glowMid: string | null;
  icon: string | null;
  showMeter: boolean;
  dotColor: string | null;
}

const STATE_CONFIGS: Record<Status, StateConfig> = {
  THROUGH: {
    statusColor: '#4ADE80',
    glowColor: 'rgba(74,222,128,0.15)',
    glowMid: 'rgba(74,222,128,0.08)',
    icon: '✅',
    showMeter: false,
    dotColor: null,
  },
  HANGING_ON: {
    statusColor: '#FCD34D',
    glowColor: 'rgba(252,211,77,0.15)',
    glowMid: 'rgba(252,211,77,0.08)',
    icon: null,
    showMeter: true,
    dotColor: '#FCD34D',
  },
  IN_DANGER: {
    statusColor: '#F87171',
    glowColor: 'rgba(248,113,113,0.15)',
    glowMid: 'rgba(248,113,113,0.08)',
    icon: null,
    showMeter: true,
    dotColor: '#F87171',
  },
  OUT: {
    statusColor: '#6B7280',
    glowColor: null,
    glowMid: null,
    icon: '❌',
    showMeter: false,
    dotColor: null,
  },
};

const STATUS_LABELS: Record<Status, string> = {
  THROUGH: 'THROUGH',
  HANGING_ON: 'HANGING\nON',
  IN_DANGER: 'IN\nDANGER',
  OUT: 'OUT',
};

const VALID_STATUSES = new Set<string>(['THROUGH', 'HANGING_ON', 'IN_DANGER', 'OUT']);

// Single font URL — only Saira Condensed 900 is loaded; everything else uses sans-serif
const SAIRA_URL =
  'https://fonts.gstatic.com/s/sairacondensed/v11/EJRMQgErUN8XuHNEtX81i9TmEkrnbcpg8Keepi2lHw.ttf';

// Fetches a TTF file with a 5-second timeout so a slow CDN can't stall the route
async function fetchFont(url: string): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      console.error(`Font fetch returned ${res.status} for ${url}`);
      throw new Error(`Font fetch failed — ${url} returned HTTP ${res.status}`);
    }
    return await res.arrayBuffer();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Handles GET /api/og?team=X&status=X&message=X&rank=X — returns a 1200×630 PNG
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const teamName = searchParams.get('team') ?? 'Unknown';
  const statusParam = searchParams.get('status') ?? 'OUT';
  const message = searchParams.get('message') ?? '';
  const rankParam = searchParams.get('rank');
  const parsedRank = rankParam ? parseInt(rankParam, 10) : NaN;
  const rank = isNaN(parsedRank) ? 1 : Math.max(1, Math.min(12, parsedRank));

  // Resolve flag server-side from the canonical teams list so it never travels in the URL
  const teamRecord = getTeamByName(teamName);
  const flag = teamRecord?.flag ?? '🌍';

  const status: Status = VALID_STATUSES.has(statusParam) ? (statusParam as Status) : 'OUT';
  const cfg = STATE_CONFIGS[status];
  const labelText = STATUS_LABELS[status];

  // Load Saira Condensed for the status label; fall back to sans-serif if the CDN is unreachable
  // so the route still returns a usable image rather than a 500.
  let sairaData: ArrayBuffer | null = null;
  try {
    sairaData = await fetchFont(SAIRA_URL);
  } catch (err) {
    console.error('Saira Condensed fetch failed, rendering in sans-serif fallback:', err);
  }

  const statusLabelFont = sairaData !== null ? 'Saira Condensed' : 'sans-serif';
  const fontOptions = sairaData !== null
    ? [{ name: 'Saira Condensed', data: sairaData, weight: 900 as const, style: 'normal' as const }]
    : [];

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 1200,
            height: 630,
            background: 'radial-gradient(circle at center, #151515 0%, #0A0A0A 55%, #080808 100%)',
            position: 'relative',
          }}
        >
          {/* gold inset border frame 12px from all edges */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              width: 1176,
              height: 606,
              border: '1px solid rgba(201,168,76,0.40)',
              display: 'flex',
            }}
          />

          {/* status-coloured radial glow in top-left quadrant (THROUGH / HANGING_ON / IN_DANGER only) */}
          {cfg.glowColor !== null && cfg.glowMid !== null && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 500,
                height: 500,
                background: `radial-gradient(circle at 30% 45%, ${cfg.glowColor} 0%, ${cfg.glowMid} 30%, transparent 45%)`,
                display: 'flex',
              }}
            />
          )}

          {/* live indicator dot top-right (HANGING_ON / IN_DANGER only) */}
          {cfg.dotColor !== null && (
            <div
              style={{
                position: 'absolute',
                top: 60,
                left: 1120,
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: cfg.dotColor,
                display: 'flex',
              }}
            />
          )}

          {/* left zone: flag · team name · status label · context message */}
          <div
            style={{
              position: 'absolute',
              top: 72,
              left: 72,
              width: 634,
              height: 438,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 120, marginBottom: 12, display: 'flex' }}>
              {flag}
            </div>
            <div
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 500,
                fontSize: 18,
                letterSpacing: '0.20em',
                color: '#666666',
                marginBottom: 28,
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {teamName}
            </div>
            <div
              style={{
                fontFamily: statusLabelFont,
                fontWeight: 900,
                fontSize: 96,
                lineHeight: '82px',
                letterSpacing: '-0.02em',
                color: cfg.statusColor,
                maxWidth: 520,
                marginBottom: 20,
                whiteSpace: 'pre-wrap',
                display: 'flex',
              }}
            >
              {labelText}
            </div>
            <div
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '24px',
                color: '#888888',
                maxWidth: 520,
                display: 'flex',
              }}
            >
              {message}
            </div>
          </div>

          {/* vertical rule dividing left content zone from right panel */}
          <div
            style={{
              position: 'absolute',
              left: 706,
              top: 105,
              width: 1,
              height: 350,
              backgroundColor: 'rgba(255,255,255,0.08)',
              display: 'flex',
            }}
          />

          {/* right zone: static emoji (THROUGH/OUT) or qualification rank meter (HANGING_ON/IN_DANGER) */}
          <div
            style={{
              position: 'absolute',
              left: 810,
              top: 145,
              width: 260,
              height: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: cfg.showMeter ? 'flex-start' : 'center',
            }}
          >
            {cfg.showMeter ? (
              <>
                {/* 12-slot bar chart showing current cross-group rank position */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    gap: 8,
                    marginBottom: 18,
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 12,
                        height: 180,
                        borderRadius: 6,
                        backgroundColor:
                          i < rank - 1
                            ? 'rgba(255,255,255,0.20)'
                            : i === rank - 1
                            ? cfg.statusColor
                            : 'rgba(255,255,255,0.08)',
                        display: 'flex',
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontFamily: 'sans-serif',
                    fontWeight: 400,
                    fontSize: 13,
                    color: '#555555',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {rank}th of 12 · top 8 qualify
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: 80,
                  opacity: status === 'OUT' ? 0.75 : 1,
                  display: 'flex',
                }}
              >
                {cfg.icon}
              </div>
            )}
          </div>

          {/* footer strip with wordmark, URL, and tournament label */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 1200,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: 72,
              paddingRight: 72,
            }}
          >
            {/* hairline separator above footer */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1200,
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.06)',
                display: 'flex',
              }}
            />
            <div
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 500,
                fontSize: 16,
                color: '#C9A84C',
                display: 'flex',
              }}
            >
              still in?
            </div>
            <div
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 400,
                fontSize: 13,
                color: '#444444',
                display: 'flex',
              }}
            >
              stillin.app
            </div>
            <div
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 400,
                fontSize: 12,
                color: '#444444',
                display: 'flex',
              }}
            >
              FIFA World Cup 2026 · Live
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontOptions,
      }
    );
  } catch (imgErr) {
    const msg = imgErr instanceof Error ? imgErr.message : String(imgErr);
    console.error('ImageResponse generation failed:', msg);
    return new Response('Failed to generate image', { status: 500 });
  }
}
