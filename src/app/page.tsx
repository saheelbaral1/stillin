// page.tsx is a server component — generateMetadata runs server-side and injects
// the correct OG tags before any HTML reaches the crawler or the browser.
// All interactivity lives in HomeClient which is marked "use client".

import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { TEAMS } from "@/lib/teams";

type Props = {
  searchParams: Promise<{
    team?: string;
    status?: string;
    message?: string;
    rank?: string;
  }>;
};

// Generates per-team OG metadata when ?team= is present in the URL.
// Falls back to generic site metadata when no team is selected so the
// home-page share still has a sensible preview image.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const teamName = params.team;
  const status   = params.status  || "HANGING_ON";
  const message  = params.message || "Is your team still in the World Cup 2026?";
  const rank     = params.rank    || "6";

  if (!teamName) {
    return {
      title: "still in?",
      description:
        "For people who are half-watching. Find out if your team is still in the World Cup 2026.",
    };
  }

  const team = TEAMS.find((t) => t.name.toLowerCase() === teamName.toLowerCase());
  const flag = team?.flag ?? "🌍";
  const ogImageUrl = `https://stillin.vercel.app/api/og?team=${encodeURIComponent(teamName)}&status=${status}&message=${encodeURIComponent(message)}&rank=${rank}`;

  return {
    title: `${flag} ${teamName} — still in?`,
    description: message,
    openGraph: {
      title: `${flag} ${teamName} — still in?`,
      description: message,
      url: `https://stillin.vercel.app/?team=${encodeURIComponent(teamName)}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${teamName} World Cup 2026 qualification status`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${flag} ${teamName} — still in?`,
      description: message,
      images: [ogImageUrl],
    },
  };
}

export default function Page() {
  return <HomeClient />;
}
