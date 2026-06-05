/* Wordmark.jsx — the "still in?" wordmark. Always lowercase, DM Mono, gold.
   `tone="onFill"` flips it to a soft white for use on a saturated status card. */

function Wordmark({ size = 19, tone = "gold" }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        fontSize: size,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        color: tone === "onFill" ? "var(--on-fill)" : "var(--gold)",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      still in<span style={{ color: tone === "onFill" ? "var(--on-fill-dim)" : "var(--gold-deep)" }}>?</span>
    </span>
  );
}

Object.assign(window, { Wordmark });
