import type { Metadata } from "next";
import { Saira_Condensed, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

/*
  Three font families, strict role separation (per the approved design system):
  · Saira Condensed 900 → status labels (THROUGH / HANGING ON / IN DANGER / OUT)
  · DM Sans 400/500/600 → everything else (headings, labels, body, meta)
  · DM Mono 500         → the "still in?" wordmark and NOTHING else

  Each is loaded as a CSS variable so globals.css can register Tailwind
  utilities and so components can reference var(--font-display) etc. in
  inline styles where needed.
*/

const sairaCondensed = Saira_Condensed({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "still in?",
  description:
    "For people who are half-watching. Find out if your team is still in the World Cup 2026 — updated live.",
  openGraph: {
    title: "still in?",
    description: "For people who are half-watching.",
    url: "https://stillin.vercel.app",
    siteName: "still in?",
    images: [
      {
        url: "https://stillin.vercel.app/api/og?team=England&status=HANGING_ON&message=Is%20your%20team%20still%20in%3F&rank=7",
        width: 1200,
        height: 630,
        alt: "still in? — World Cup 2026 qualification tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "still in?",
    description: "For people who are half-watching.",
    images: [
      "https://stillin.vercel.app/api/og?team=England&status=HANGING_ON&message=Is%20your%20team%20still%20in%3F&rank=7",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sairaCondensed.variable} ${dmSans.variable} ${dmMono.variable}`}
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <body className="min-h-screen font-body text-[#0A0A0A] antialiased">
        {children}
      </body>
    </html>
  );
}
