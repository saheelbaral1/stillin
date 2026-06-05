/* SearchScreen.jsx — Screen 1. "Which team are you following?"
   Big condensed question, a search field with a live dropdown, and the five
   popular-team quick-pick pills. Selecting anywhere calls onPick(teamName). */

function SearchScreen({ onPick }) {
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? TEAM_LIST.filter((t) => t.name.toLowerCase().includes(trimmed)).slice(0, 6)
    : [];
  const showDrop = focused && results.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", padding: "0 20px" }}>
      {/* top chrome */}
      <div style={{ display: "flex", alignItems: "center", height: 64 }}>
        <Wordmark />
      </div>

      {/* heading block */}
      <div style={{ marginTop: 40 }}>
        <p className="t-kicker" style={{ marginBottom: 16 }}>World Cup 2026 · Live</p>
        <h1
          className="t-display"
          style={{ fontSize: 46, lineHeight: 0.96 }}
        >
          Which team<br />are you<br />following?
        </h1>
        <p className="t-body" style={{ marginTop: 16, maxWidth: 300 }}>
          One question, one answer. We'll tell you in plain English if they're still in.
        </p>
      </div>

      {/* search field */}
      <div style={{ position: "relative", marginTop: 28 }}>
        <div style={{ position: "relative", height: 56 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", display: "flex" }}>
            <SearchIcon size={19} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            placeholder="Search your team…"
            style={{
              width: "100%", height: "100%", paddingLeft: 46, paddingRight: 16,
              fontFamily: "var(--font-body)", fontSize: 16, color: "var(--ink)",
              background: "var(--surface)", border: `2px solid ${focused ? "var(--ink)" : "var(--line)"}`,
              borderRadius: "var(--r-input)", outline: "none", transition: "border-color var(--dur) var(--ease)",
              boxShadow: focused ? "0 0 0 4px var(--gold-soft)" : "none",
            }}
          />
        </div>

        {showDrop && (
          <ul
            style={{
              position: "absolute", left: 0, right: 0, top: 62, zIndex: 20, margin: 0, padding: 6, listStyle: "none",
              background: "var(--surface)", border: "2px solid var(--line)", borderRadius: "var(--r-input)",
              boxShadow: "var(--shadow-pop)", overflow: "hidden",
            }}
          >
            {results.map((t) => (
              <li key={t.name}>
                <button
                  onMouseDown={(e) => { e.preventDefault(); onPick(t.name); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                    textAlign: "left", background: "transparent", border: "none", borderRadius: 9, cursor: "pointer",
                    fontFamily: "var(--font-body)", fontSize: 15, color: "var(--ink)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{t.flag}</span>
                  <span style={{ flex: 1 }}>{t.name}</span>
                  <span className="t-meta">GROUP {t.group}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* popular pills */}
      <p className="t-kicker" style={{ marginTop: 28, marginBottom: 12, fontSize: 11 }}>Most followed</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {POPULAR.map((name) => {
          const t = TEAMS[name];
          return (
            <button
              key={name}
              onClick={() => onPick(name)}
              className="pill"
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
                background: "var(--surface)", border: "1.5px solid var(--line)", borderRadius: "var(--r-pill)",
                fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "var(--ink-2)", cursor: "pointer",
                transition: "all var(--dur) var(--ease)",
              }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>{t.flag}</span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* footer line */}
      <p className="t-meta" style={{ textAlign: "center", padding: "24px 0 20px", color: "var(--ink-3)" }}>
        48 teams · 12 groups · updated live every 60s
      </p>
    </div>
  );
}

Object.assign(window, { SearchScreen });
