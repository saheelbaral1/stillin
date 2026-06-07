"use client";

import { useState, useEffect, useRef } from "react";

type Theme = "light" | "dark";

const WC_PARTICLES = ["⚽", "🏆", "⭐", "🌟", "🎊", "✨", "🥅"];

// Burst WC-themed emoji particles from the button's centre position.
// Uses the Web Animations API — no external packages.
function fireConfetti(btn: HTMLElement) {
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 18; i++) {
    const el = document.createElement("span");
    el.textContent = WC_PARTICLES[Math.floor(Math.random() * WC_PARTICLES.length)];
    Object.assign(el.style, {
      position: "fixed",
      left: `${cx}px`,
      top: `${cy}px`,
      fontSize: `${12 + Math.random() * 10}px`,
      pointerEvents: "none",
      zIndex: "9999",
      userSelect: "none",
      lineHeight: "1",
    });
    document.body.appendChild(el);

    const angle = (i / 18) * Math.PI * 2 + Math.random() * ((Math.PI * 2) / 18);
    const dist  = 55 + Math.random() * 90;
    const dx    = Math.cos(angle) * dist;
    const dy    = Math.sin(angle) * dist - 35; // bias upward
    const spin  = (Math.random() - 0.5) * 720;
    const dur   = 600 + Math.random() * 400;

    el.animate(
      [
        {
          transform: "translate(-50%,-50%) rotate(0deg) scale(1)",
          opacity: 1,
        },
        {
          transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${spin}deg) scale(0.25)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: "cubic-bezier(0.25,0.46,0.45,0.94)", fill: "forwards" }
    ).onfinish = () => el.remove();
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const btnRef = useRef<HTMLButtonElement>(null);

  // On mount, sync with whatever the inline script already applied so the
  // React state matches the DOM without a flash.
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null) ?? "dark";
    setTheme(saved);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);

    if (btnRef.current) {
      // Elastic spin on the button itself
      btnRef.current.animate(
        [
          { transform: "scale(1) rotate(0deg)" },
          { transform: "scale(0.76) rotate(180deg)" },
          { transform: "scale(1.14) rotate(360deg)" },
          { transform: "scale(1) rotate(360deg)" },
        ],
        { duration: 420, easing: "cubic-bezier(0.34,1.56,0.64,1)" }
      );
      fireConfetti(btnRef.current);
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "1.5px solid var(--toggle-border)",
        background: "var(--toggle-bg)",
        boxShadow: "var(--toggle-shadow)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "background 220ms var(--ease), border-color 220ms var(--ease), box-shadow 220ms var(--ease)",
      }}
    >
      {isDark ? (
        /* Sun — visible in dark mode, click to go light */
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--gold)" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2"     x2="12" y2="6"/>
          <line x1="12" y1="18"    x2="12" y2="22"/>
          <line x1="4.22"  y1="4.22"  x2="7.05"  y2="7.05"/>
          <line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/>
          <line x1="2"     y1="12"    x2="6"     y2="12"/>
          <line x1="18"    y1="12"    x2="22"    y2="12"/>
          <line x1="4.22"  y1="19.78" x2="7.05"  y2="16.95"/>
          <line x1="16.95" y1="7.05"  x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        /* Moon — visible in light mode, click to go dark */
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="var(--nav-text)" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
