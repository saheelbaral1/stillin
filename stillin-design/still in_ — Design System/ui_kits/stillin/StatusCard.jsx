/* StatusCard.jsx — Screen 2. The answer.
   A bold, saturated "scoreboard" card whose status label is the biggest element
   on the screen, with a live heartbeat for HANGING ON / IN DANGER. Below the
   card: share, the notify-me email capture, and the "what does this mean?"
   explainer — all from the real product (StatusCard / ShareButton /
   NotifyCapture / ExplainButton). */

function LivePill() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7,
      padding: "5px 10px 5px 9px", borderRadius: "var(--r-pill)",
      background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.22)" }}>
      <span style={{ position: "relative", width: 8, height: 8, display: "inline-flex" }}>
        <span className="live-ring" style={{ position: "absolute", inset: 0, borderRadius: "50%",
          background: "var(--on-fill)", animation: "live-ring 1.6s ease-out infinite" }} />
        <span className="live-dot" style={{ position: "relative", width: 8, height: 8, borderRadius: "50%",
          background: "var(--on-fill)", animation: "live-pulse 1.6s ease-in-out infinite" }} />
      </span>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 10.5,
        letterSpacing: "0.18em", color: "var(--on-fill)" }}>LIVE</span>
    </span>
  );
}

/* Cross-group third-place meter. 12 cells, top 8 qualify, gold pip on the
   team's current rank. Only meaningful for HANGING ON / IN DANGER. */
function QualifyMeter({ rank }) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 9 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const n = i + 1;
          const inZone = n <= 8;
          const isTeam = n === rank;
          return (
            <div key={n} style={{ flex: 1, position: "relative" }}>
              <div style={{
                height: 8, borderRadius: 2,
                background: isTeam ? "var(--gold)"
                  : inZone ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.13)",
                boxShadow: isTeam ? "0 0 0 2px rgba(0,0,0,0.18)" : "none",
              }} />
              {n === 8 && (
                <span style={{ position: "absolute", right: -3, top: -4, bottom: -4, width: 2,
                  background: "var(--on-fill)", borderRadius: 2, opacity: 0.9 }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10.5, letterSpacing: "0.04em", color: "var(--on-fill)" }}>
          {rank}{ordinal(rank)} of 12 third-placed
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10.5, letterSpacing: "0.04em", color: "var(--on-fill-dim)" }}>
          top 8 qualify
        </span>
      </div>
    </div>
  );
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function StatusCard({ team, onBack }) {
  const st = team.state;
  const [copied, setCopied] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);
  const [explainOpen, setExplainOpen] = React.useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", padding: "0 20px" }}>
      {/* top chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: 64 }}>
        <button onClick={onBack} aria-label="Change team" style={{
          display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38,
          marginLeft: -8, borderRadius: 10, border: "none", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>
          <ArrowLeftIcon size={20} />
        </button>
        <Wordmark />
      </div>

      {/* ── the scoreboard card · solid fill, gold hairline, depth gradient ── */}
      <div style={{
        marginTop: 8, borderRadius: "var(--r-card)", padding: "40px 22px 40px",
        background: st.fill,
        border: "1px solid rgba(201,168,76,0.4)", boxShadow: "var(--shadow-hero)",
        position: "relative", overflow: "hidden",
      }}>
        {/* depth gradient — transparent → black at the foot, makes white type pop */}
        <div style={{ position: "absolute", inset: 0, background:
          "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.20) 100%)", pointerEvents: "none" }} />

        {/* card top row */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11,
            letterSpacing: "0.12em", color: "var(--on-fill-dim)" }}>
            GROUP {team.group} · {team.played} PLAYED
          </span>
          {st.live ? <LivePill /> : <Wordmark size={14} tone="onFill" />}
        </div>

        {/* flag + team */}
        <div style={{ position: "relative", marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 48, lineHeight: 1, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.30))" }}>{team.flag}</span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12.5,
            letterSpacing: "0.22em", color: "var(--on-fill)", textTransform: "uppercase" }}>{team.name}</span>
        </div>

        {/* THE LABEL */}
        <div style={{ position: "relative", marginTop: 14, textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 900, textTransform: "uppercase",
            fontSize: st.label.length > 8 ? 60 : 74, lineHeight: 0.82, letterSpacing: "-0.02em",
            color: "var(--on-fill)", textShadow: "0 2px 0 rgba(0,0,0,0.12)", margin: 0,
          }}>
            {st.label.includes(" ")
              ? st.label.split(" ").map((w, i) => <div key={i}>{w}</div>)
              : st.label}
          </h2>
        </div>

        {/* message */}
        <p style={{ position: "relative", marginTop: 18, textAlign: "center",
          fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15.5, lineHeight: 1.4, color: "var(--on-fill)" }}>
          {team.message}
        </p>

        {/* meter or detail */}
        <div style={{ position: "relative", marginTop: 18 }}>
          {team.rank ? <QualifyMeter rank={team.rank} /> : (
            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 11,
              letterSpacing: "0.04em", color: "var(--on-fill-dim)" }}>{team.detail}</p>
          )}
        </div>
      </div>

      {/* ── share ── */}
      <button
        onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }}
        style={{
          marginTop: 16, height: 52, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          background: "var(--gold)", color: "#1A1306", border: "none", borderRadius: "var(--r-btn)", cursor: "pointer",
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15.5, boxShadow: "var(--shadow-card)",
          transition: "filter var(--dur) var(--ease)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
      >
        {copied ? <CheckIcon size={19} /> : <ShareIcon size={18} />}
        {copied ? "Link copied" : "Share this result"}
      </button>

      {/* ── explain · gold→purple AI-gradient text signals the AI explainer ── */}
      <button onClick={() => setExplainOpen((v) => !v)} style={{
        marginTop: 16, alignSelf: "center", border: "none", cursor: "pointer",
        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5,
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "var(--ai-grad)", WebkitBackgroundClip: "text", backgroundClip: "text",
        WebkitTextFillColor: "transparent", color: "transparent" }}>
        <span aria-hidden="true">✦</span> Wait, what does this mean?
      </button>
      {explainOpen && (
        <div style={{ marginTop: 12, background: "var(--surface)", border: "1.5px solid var(--line)",
          borderRadius: 12, padding: "14px 15px", boxShadow: "var(--shadow-card)" }}>
          <p className="t-body" style={{ color: "var(--ink-2)", lineHeight: 1.55 }}>
            They've done just enough to maybe sneak through, but it hinges on other matches.
            Think of it like being 6th in a queue where only the first 8 get in — comfortable,
            not safe. One result elsewhere could nudge them either way.
          </p>
          <p style={{ marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22,
            letterSpacing: "0.02em", color: st.ink, textTransform: "uppercase" }}>
            {st.key === "THROUGH" ? "RELAX" : st.key === "OUT" ? "—" : "NERVOUS"}
          </p>
        </div>
      )}

      {/* ── notify capture ── */}
      <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
        {subscribed ? (
          <p className="t-body" style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: "var(--ink)" }}>
            <span style={{ color: "var(--through-ink)", display: "inline-flex" }}><CheckIcon size={17} /></span>
            You're on the list — we'll email you the moment it's decided.
          </p>
        ) : (
          <React.Fragment>
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", marginBottom: 10 }}>
              <BellIcon size={15} /> Notify me the moment it's decided
            </p>
            <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true); }}
              style={{ display: "flex", gap: 8 }}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, height: 48, padding: "0 14px", fontFamily: "var(--font-body)", fontSize: 14,
                  color: "var(--ink)", background: "var(--surface)", border: "1.5px solid var(--line)",
                  borderRadius: 11, outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
              />
              <button type="submit" style={{ height: 48, padding: "0 18px", flexShrink: 0,
                background: "var(--ink)", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer",
                fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14 }}>
                Notify me
              </button>
            </form>
          </React.Fragment>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 16 }} />
      <p className="t-meta" style={{ textAlign: "center", padding: "16px 0 20px", color: "var(--ink-3)" }}>
        stillin.app · for people who are half-watching
      </p>
    </div>
  );
}

Object.assign(window, { StatusCard, LivePill, QualifyMeter });
