/* @ds-bundle: {"format":3,"namespace":"StillInDesignSystem_f5dda9","components":[],"sourceHashes":{"ui_kits/stillin/App.jsx":"8fe60e81f664","ui_kits/stillin/SearchScreen.jsx":"46165fc013f5","ui_kits/stillin/StatusCard.jsx":"6871bfbb6b0e","ui_kits/stillin/Wordmark.jsx":"6c08903339d0","ui_kits/stillin/data.jsx":"4e006ac32402","ui_kits/stillin/icons.jsx":"f39d05281fb5"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.StillInDesignSystem_f5dda9 = window.StillInDesignSystem_f5dda9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/stillin/App.jsx
try { (() => {
/* App.jsx — wires Screen 1 ↔ Screen 2 inside a 390px mobile web frame.
   This is the whole product: team picker → status card. No nav, no tabs. */

function StatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: 14,
      color: "var(--ink)"
    }
  }, "9:41"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "var(--ink)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "11",
    viewBox: "0 0 17 11",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "6",
    width: "3",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.5",
    y: "4",
    width: "3",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "2",
    width: "3",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13.5",
    y: "0",
    width: "3",
    height: "11",
    rx: "1"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "11",
    viewBox: "0 0 16 11",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 2.5c2 0 3.8.8 5.2 2l1.1-1.2C13.6 1.7 11 .7 8 .7S2.4 1.7.7 3.3L1.8 4.5C3.2 3.3 5 2.5 8 2.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 6c1 0 2 .4 2.7 1.1l1.1-1.1C10.7 4.9 9.4 4.4 8 4.4s-2.7.5-3.8 1.6l1.1 1.1C6 6.4 7 6 8 6z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "9.2",
    r: "1.6"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "25",
    height: "12",
    viewBox: "0 0 25 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "21",
    height: "11",
    rx: "3",
    stroke: "currentColor",
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "17",
    height: "8",
    rx: "1.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "23",
    y: "4",
    width: "1.5",
    height: "4",
    rx: "0.75",
    fill: "currentColor",
    opacity: "0.5"
  }))));
}
function App() {
  const [screen, setScreen] = React.useState({
    name: "search"
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "phone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "phone-screen"
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    className: "phone-scroll"
  }, screen.name === "search" ? /*#__PURE__*/React.createElement(SearchScreen, {
    onPick: name => setScreen({
      name: "status",
      team: name
    })
  }) : /*#__PURE__*/React.createElement(StatusCard, {
    team: TEAMS[screen.team],
    onBack: () => setScreen({
      name: "search"
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "home-indicator"
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/stillin/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/stillin/SearchScreen.jsx
try { (() => {
/* SearchScreen.jsx — Screen 1. "Which team are you following?"
   Big condensed question, a search field with a live dropdown, and the five
   popular-team quick-pick pills. Selecting anywhere calls onPick(teamName). */

function SearchScreen({
  onPick
}) {
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const trimmed = query.trim().toLowerCase();
  const results = trimmed ? TEAM_LIST.filter(t => t.name.toLowerCase().includes(trimmed)).slice(0, 6) : [];
  const showDrop = focused && results.length > 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100%",
      padding: "0 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      height: 64
    }
  }, /*#__PURE__*/React.createElement(Wordmark, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "t-kicker",
    style: {
      marginBottom: 16
    }
  }, "World Cup 2026 \xB7 Live"), /*#__PURE__*/React.createElement("h1", {
    className: "t-display",
    style: {
      fontSize: 46,
      lineHeight: 0.96
    }
  }, "Which team", /*#__PURE__*/React.createElement("br", null), "are you", /*#__PURE__*/React.createElement("br", null), "following?"), /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      marginTop: 16,
      maxWidth: 300
    }
  }, "One question, one answer. We'll tell you in plain English if they're still in.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 56
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 16,
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--ink-3)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(SearchIcon, {
    size: 19
  })), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setTimeout(() => setFocused(false), 120),
    placeholder: "Search your team\u2026",
    style: {
      width: "100%",
      height: "100%",
      paddingLeft: 46,
      paddingRight: 16,
      fontFamily: "var(--font-body)",
      fontSize: 16,
      color: "var(--ink)",
      background: "var(--surface)",
      border: `2px solid ${focused ? "var(--ink)" : "var(--line)"}`,
      borderRadius: "var(--r-input)",
      outline: "none",
      transition: "border-color var(--dur) var(--ease)",
      boxShadow: focused ? "0 0 0 4px var(--gold-soft)" : "none"
    }
  })), showDrop && /*#__PURE__*/React.createElement("ul", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 62,
      zIndex: 20,
      margin: 0,
      padding: 6,
      listStyle: "none",
      background: "var(--surface)",
      border: "2px solid var(--line)",
      borderRadius: "var(--r-input)",
      boxShadow: "var(--shadow-pop)",
      overflow: "hidden"
    }
  }, results.map(t => /*#__PURE__*/React.createElement("li", {
    key: t.name
  }, /*#__PURE__*/React.createElement("button", {
    onMouseDown: e => {
      e.preventDefault();
      onPick(t.name);
    },
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "11px 12px",
      textAlign: "left",
      background: "transparent",
      border: "none",
      borderRadius: 9,
      cursor: "pointer",
      fontFamily: "var(--font-body)",
      fontSize: 15,
      color: "var(--ink)"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--surface-2)",
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      lineHeight: 1
    }
  }, t.flag), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, t.name), /*#__PURE__*/React.createElement("span", {
    className: "t-meta"
  }, "GROUP ", t.group)))))), /*#__PURE__*/React.createElement("p", {
    className: "t-kicker",
    style: {
      marginTop: 28,
      marginBottom: 12,
      fontSize: 11
    }
  }, "Most followed"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, POPULAR.map(name => {
    const t = TEAMS[name];
    return /*#__PURE__*/React.createElement("button", {
      key: name,
      onClick: () => onPick(name),
      className: "pill",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 14px",
        background: "var(--surface)",
        border: "1.5px solid var(--line)",
        borderRadius: "var(--r-pill)",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        fontSize: 14,
        color: "var(--ink-2)",
        cursor: "pointer",
        transition: "all var(--dur) var(--ease)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 17,
        lineHeight: 1
      }
    }, t.flag), /*#__PURE__*/React.createElement("span", null, name));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "t-meta",
    style: {
      textAlign: "center",
      padding: "24px 0 20px",
      color: "var(--ink-3)"
    }
  }, "48 teams \xB7 12 groups \xB7 updated live every 60s"));
}
Object.assign(window, {
  SearchScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/stillin/SearchScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/stillin/StatusCard.jsx
try { (() => {
/* StatusCard.jsx — Screen 2. The answer.
   A bold, saturated "scoreboard" card whose status label is the biggest element
   on the screen, with a live heartbeat for HANGING ON / IN DANGER. Below the
   card: share, the notify-me email capture, and the "what does this mean?"
   explainer — all from the real product (StatusCard / ShareButton /
   NotifyCapture / ExplainButton). */

function LivePill() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "5px 10px 5px 9px",
      borderRadius: "var(--r-pill)",
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.22)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      width: 8,
      height: 8,
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "live-ring",
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      background: "var(--on-fill)",
      animation: "live-ring 1.6s ease-out infinite"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "live-dot",
    style: {
      position: "relative",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--on-fill)",
      animation: "live-pulse 1.6s ease-in-out infinite"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 10.5,
      letterSpacing: "0.18em",
      color: "var(--on-fill)"
    }
  }, "LIVE"));
}

/* Cross-group third-place meter. 12 cells, top 8 qualify, gold pip on the
   team's current rank. Only meaningful for HANGING ON / IN DANGER. */
function QualifyMeter({
  rank
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 3,
      marginBottom: 9
    }
  }, Array.from({
    length: 12
  }).map((_, i) => {
    const n = i + 1;
    const inZone = n <= 8;
    const isTeam = n === rank;
    return /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        flex: 1,
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 8,
        borderRadius: 2,
        background: isTeam ? "var(--gold)" : inZone ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.13)",
        boxShadow: isTeam ? "0 0 0 2px rgba(0,0,0,0.18)" : "none"
      }
    }), n === 8 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        right: -3,
        top: -4,
        bottom: -4,
        width: 2,
        background: "var(--on-fill)",
        borderRadius: 2,
        opacity: 0.9
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 10.5,
      letterSpacing: "0.04em",
      color: "var(--on-fill)"
    }
  }, rank, ordinal(rank), " of 12 third-placed"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 10.5,
      letterSpacing: "0.04em",
      color: "var(--on-fill-dim)"
    }
  }, "top 8 qualify")));
}
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
function StatusCard({
  team,
  onBack
}) {
  const st = team.state;
  const [copied, setCopied] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);
  const [explainOpen, setExplainOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100%",
      padding: "0 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      height: 64
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Change team",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      marginLeft: -8,
      borderRadius: 10,
      border: "none",
      background: "transparent",
      color: "var(--ink)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(ArrowLeftIcon, {
    size: 20
  })), /*#__PURE__*/React.createElement(Wordmark, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      borderRadius: "var(--r-card)",
      padding: "40px 22px 40px",
      background: st.fill,
      border: "1px solid rgba(201,168,76,0.4)",
      boxShadow: "var(--shadow-hero)",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.20) 100%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 11,
      letterSpacing: "0.12em",
      color: "var(--on-fill-dim)"
    }
  }, "GROUP ", team.group, " \xB7 ", team.played, " PLAYED"), st.live ? /*#__PURE__*/React.createElement(LivePill, null) : /*#__PURE__*/React.createElement(Wordmark, {
    size: 14,
    tone: "onFill"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      marginTop: 18,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 48,
      lineHeight: 1,
      filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.30))"
    }
  }, team.flag), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 12.5,
      letterSpacing: "0.22em",
      color: "var(--on-fill)",
      textTransform: "uppercase"
    }
  }, team.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      marginTop: 14,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 900,
      textTransform: "uppercase",
      fontSize: st.label.length > 8 ? 60 : 74,
      lineHeight: 0.82,
      letterSpacing: "-0.02em",
      color: "var(--on-fill)",
      textShadow: "0 2px 0 rgba(0,0,0,0.12)",
      margin: 0
    }
  }, st.label.includes(" ") ? st.label.split(" ").map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, w)) : st.label)), /*#__PURE__*/React.createElement("p", {
    style: {
      position: "relative",
      marginTop: 18,
      textAlign: "center",
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 15.5,
      lineHeight: 1.4,
      color: "var(--on-fill)"
    }
  }, team.message), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      marginTop: 18
    }
  }, team.rank ? /*#__PURE__*/React.createElement(QualifyMeter, {
    rank: team.rank
  }) : /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: "center",
      fontFamily: "var(--font-body)",
      fontSize: 11,
      letterSpacing: "0.04em",
      color: "var(--on-fill-dim)"
    }
  }, team.detail))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    },
    style: {
      marginTop: 16,
      height: 52,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      background: "var(--gold)",
      color: "#1A1306",
      border: "none",
      borderRadius: "var(--r-btn)",
      cursor: "pointer",
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: 15.5,
      boxShadow: "var(--shadow-card)",
      transition: "filter var(--dur) var(--ease)"
    },
    onMouseEnter: e => e.currentTarget.style.filter = "brightness(1.05)",
    onMouseLeave: e => e.currentTarget.style.filter = "none"
  }, copied ? /*#__PURE__*/React.createElement(CheckIcon, {
    size: 19
  }) : /*#__PURE__*/React.createElement(ShareIcon, {
    size: 18
  }), copied ? "Link copied" : "Share this result"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setExplainOpen(v => !v),
    style: {
      marginTop: 16,
      alignSelf: "center",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: 13.5,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "var(--ai-grad)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u2726"), " Wait, what does this mean?"), explainOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      background: "var(--surface)",
      border: "1.5px solid var(--line)",
      borderRadius: 12,
      padding: "14px 15px",
      boxShadow: "var(--shadow-card)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      color: "var(--ink-2)",
      lineHeight: 1.55
    }
  }, "They've done just enough to maybe sneak through, but it hinges on other matches. Think of it like being 6th in a queue where only the first 8 get in \u2014 comfortable, not safe. One result elsewhere could nudge them either way."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 10,
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: 22,
      letterSpacing: "0.02em",
      color: st.ink,
      textTransform: "uppercase"
    }
  }, st.key === "THROUGH" ? "RELAX" : st.key === "OUT" ? "—" : "NERVOUS")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      paddingTop: 20,
      borderTop: "1px solid var(--line)"
    }
  }, subscribed ? /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      color: "var(--ink)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--through-ink)",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(CheckIcon, {
    size: 17
  })), "You're on the list \u2014 we'll email you the moment it's decided.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: "var(--ink-3)",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(BellIcon, {
    size: 15
  }), " Notify me the moment it's decided"), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      if (email.trim()) setSubscribed(true);
    },
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "your@email.com",
    style: {
      flex: 1,
      height: 48,
      padding: "0 14px",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: "var(--ink)",
      background: "var(--surface)",
      border: "1.5px solid var(--line)",
      borderRadius: 11,
      outline: "none"
    },
    onFocus: e => e.currentTarget.style.borderColor = "var(--ink)",
    onBlur: e => e.currentTarget.style.borderColor = "var(--line)"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: {
      height: 48,
      padding: "0 18px",
      flexShrink: 0,
      background: "var(--ink)",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      fontSize: 14
    }
  }, "Notify me")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 16
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "t-meta",
    style: {
      textAlign: "center",
      padding: "16px 0 20px",
      color: "var(--ink-3)"
    }
  }, "stillin.app \xB7 for people who are half-watching"));
}
Object.assign(window, {
  StatusCard,
  LivePill,
  QualifyMeter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/stillin/StatusCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/stillin/Wordmark.jsx
try { (() => {
/* Wordmark.jsx — the "still in?" wordmark. Always lowercase, DM Mono, gold.
   `tone="onFill"` flips it to a soft white for use on a saturated status card. */

function Wordmark({
  size = 19,
  tone = "gold"
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontWeight: 500,
      fontSize: size,
      letterSpacing: "-0.01em",
      lineHeight: 1,
      color: tone === "onFill" ? "var(--on-fill)" : "var(--gold)",
      userSelect: "none",
      whiteSpace: "nowrap"
    }
  }, "still in", /*#__PURE__*/React.createElement("span", {
    style: {
      color: tone === "onFill" ? "var(--on-fill-dim)" : "var(--gold-deep)"
    }
  }, "?"));
}
Object.assign(window, {
  Wordmark
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/stillin/Wordmark.jsx", error: String((e && e.message) || e) }); }

// ui_kits/stillin/data.jsx
try { (() => {
/* data.jsx — fake-but-faithful product data for the UI kit click-through.
   Mirrors the real app's TeamStatus shape (lib/qualification.ts) and the four
   states from STILLIN_MASTER.md §3. England → HANGING ON is the hero. The five
   popular pills are seeded to showcase every state. Real app reads this live
   from a cron-cached standings feed every 60s; here it's hardcoded. */

const STATE = {
  THROUGH: {
    key: "THROUGH",
    label: "THROUGH",
    live: false,
    ink: "var(--through-ink)",
    fill: "var(--through-fill)",
    fill2: "var(--through-fill-2)",
    tint: "var(--through-tint)",
    tintLine: "var(--through-tint-line)"
  },
  HANGING_ON: {
    key: "HANGING_ON",
    label: "HANGING ON",
    live: true,
    ink: "var(--hanging-ink)",
    fill: "var(--hanging-fill)",
    fill2: "var(--hanging-fill-2)",
    tint: "var(--hanging-tint)",
    tintLine: "var(--hanging-tint-line)"
  },
  IN_DANGER: {
    key: "IN_DANGER",
    label: "IN DANGER",
    live: true,
    ink: "var(--danger-ink)",
    fill: "var(--danger-fill)",
    fill2: "var(--danger-fill-2)",
    tint: "var(--danger-tint)",
    tintLine: "var(--danger-tint-line)"
  },
  OUT: {
    key: "OUT",
    label: "OUT",
    live: false,
    ink: "var(--out-ink)",
    fill: "var(--out-fill)",
    fill2: "var(--out-fill-2)",
    tint: "var(--out-tint)",
    tintLine: "var(--out-tint-line)"
  }
};

// Popular quick-pick pills, in the real app's order.
const POPULAR = ["England", "Brazil", "Argentina", "France", "USA"];

// team → status snapshot. rank = position among the 12 third-placed teams
// (only meaningful for HANGING_ON / IN_DANGER); 8 qualify.
const TEAMS = {
  England: {
    name: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    group: "C",
    played: 2,
    state: STATE.HANGING_ON,
    message: "Third in Group C — and right now, that's just enough.",
    detail: "6th of 12 third-placed teams. The top 8 go through.",
    rank: 6
  },
  Brazil: {
    name: "Brazil",
    flag: "🇧🇷",
    group: "D",
    played: 3,
    state: STATE.THROUGH,
    message: "Brazil are through to the Round of 32.",
    detail: "Won Group D. Nothing left to sweat.",
    rank: null
  },
  Argentina: {
    name: "Argentina",
    flag: "🇦🇷",
    group: "A",
    played: 3,
    state: STATE.THROUGH,
    message: "Argentina are through as group winners.",
    detail: "Top of Group A with a game to spare.",
    rank: null
  },
  France: {
    name: "France",
    flag: "🇫🇷",
    group: "B",
    played: 2,
    state: STATE.IN_DANGER,
    message: "Third in Group B, and slipping out of the queue.",
    detail: "10th of 12 third-placed teams. Only 8 go through.",
    rank: 10
  },
  USA: {
    name: "USA",
    flag: "🇺🇸",
    group: "K",
    played: 3,
    state: STATE.OUT,
    message: "It's over — the USA are out of the World Cup.",
    detail: "Finished 4th in Group K. Eliminated.",
    rank: null
  },
  // a couple extra so search returns something beyond the pills
  Spain: {
    name: "Spain",
    flag: "🇪🇸",
    group: "H",
    played: 2,
    state: STATE.THROUGH,
    message: "Spain are through to the Round of 32.",
    detail: "Sealed top spot in Group H.",
    rank: null
  },
  Germany: {
    name: "Germany",
    flag: "🇩🇪",
    group: "C",
    played: 2,
    state: STATE.HANGING_ON,
    message: "Second in Group C — holding a qualifying spot.",
    detail: "Needs a point to be mathematically safe.",
    rank: null
  },
  Mexico: {
    name: "Mexico",
    flag: "🇲🇽",
    group: "L",
    played: 2,
    state: STATE.IN_DANGER,
    message: "Third in Group L and outside the cut.",
    detail: "9th of 12 third-placed teams. Only 8 go through.",
    rank: 9
  }
};
const TEAM_LIST = Object.values(TEAMS);

// National colours — the IDENTITY of each card. `nat` drives the giant status
// label, the card border, and the qualify-meter pip; `bg` is a faint wash of it
// behind the white card. The WC status (green/amber/red/grey) is layered on top
// only as a small secondary indicator, so every team's card feels its own.
const NATIONAL = {
  England: {
    nat: "#CF0000",
    bg: "#FFF5F5"
  },
  Brazil: {
    nat: "#009C3B",
    bg: "#F0FBF4"
  },
  Argentina: {
    nat: "#4F86C6",
    bg: "#F2F7FC"
  },
  France: {
    nat: "#003189",
    bg: "#F1F4FB"
  },
  USA: {
    nat: "#0A3161",
    bg: "#F1F4F9"
  },
  Spain: {
    nat: "#C60B1E",
    bg: "#FFF4F4"
  },
  Germany: {
    nat: "#1A1A1A",
    bg: "#F5F5F4"
  },
  Mexico: {
    nat: "#006847",
    bg: "#F0FAF5"
  }
};
function national(name) {
  return NATIONAL[name] || {
    nat: "#0A0A0A",
    bg: "#F7F7F6"
  };
}
Object.assign(window, {
  STATE,
  POPULAR,
  TEAMS,
  TEAM_LIST,
  NATIONAL,
  national
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/stillin/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/stillin/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* icons.jsx — line icons for the still in? UI kit.
   Lucide-style geometry: 24x24 grid, stroke 2, round caps/joins. The product's
   own search field uses exactly this magnifier (circle + handle), so the whole
   kit stays on one icon language instead of mixing emoji UI glyphs. */

function Icon({
  children,
  size = 20,
  stroke = 2,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, rest), children);
}
const SearchIcon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "8"
}), /*#__PURE__*/React.createElement("line", {
  x1: "21",
  y1: "21",
  x2: "16.65",
  y2: "16.65"
}));
const ShareIcon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "16 6 12 2 8 6"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "2",
  x2: "12",
  y2: "15"
}));
const ArrowLeftIcon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("line", {
  x1: "19",
  y1: "12",
  x2: "5",
  y2: "12"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "12 19 5 12 12 5"
}));
const CheckIcon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("polyline", {
  points: "20 6 9 17 4 12"
}));
const BellIcon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10.3 21a1.94 1.94 0 0 0 3.4 0"
}));
Object.assign(window, {
  Icon,
  SearchIcon,
  ShareIcon,
  ArrowLeftIcon,
  CheckIcon,
  BellIcon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/stillin/icons.jsx", error: String((e && e.message) || e) }); }

})();
