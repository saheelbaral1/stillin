/* App.jsx — wires Screen 1 ↔ Screen 2 inside a 390px mobile web frame.
   This is the whole product: team picker → status card. No nav, no tabs. */

function StatusBar() {
  return (
    <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0 }}>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink)" }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="4.5" y="4" width="3" height="7" rx="1"/><rect x="9" y="2" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2.5c2 0 3.8.8 5.2 2l1.1-1.2C13.6 1.7 11 .7 8 .7S2.4 1.7.7 3.3L1.8 4.5C3.2 3.3 5 2.5 8 2.5z"/><path d="M8 6c1 0 2 .4 2.7 1.1l1.1-1.1C10.7 4.9 9.4 4.4 8 4.4s-2.7.5-3.8 1.6l1.1 1.1C6 6.4 7 6 8 6z"/><circle cx="8" cy="9.2" r="1.6"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4"/><rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/><rect x="23" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.5"/></svg>
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = React.useState({ name: "search" });

  return (
    <div className="phone">
      <div className="phone-screen">
        <StatusBar />
        <div className="phone-scroll">
          {screen.name === "search"
            ? <SearchScreen onPick={(name) => setScreen({ name: "status", team: name })} />
            : <StatusCard team={TEAMS[screen.team]} onBack={() => setScreen({ name: "search" })} />}
        </div>
        <div className="home-indicator" />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
