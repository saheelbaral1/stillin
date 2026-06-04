import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

// Google Fonts loaded via next/font — self-hosted, zero layout shift, no
// external network request from the browser. Each font injects its CSS variable
// onto the <html> element so Tailwind's font-syne / font-dm-sans / font-dm-mono
// utilities (registered in globals.css @theme) resolve at runtime.

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "still in?",
  description:
    "Find out if your team is still in the World Cup 2026 — updated live.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Background applied inline so it's guaranteed to override any UA stylesheet
    // and is consistent with the Section 11 design token (#F5F4F0) without
    // requiring a Tailwind arbitrary-value class that a purge could strip.
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
      style={{ backgroundColor: "#F5F4F0" }}
    >
      <body className="min-h-screen font-dm-sans text-[#111111] antialiased">
        {children}
      </body>
    </html>
  );
}
