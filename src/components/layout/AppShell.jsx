function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="app-shell__noise" aria-hidden="true" />
      <div className="app-shell__grid" aria-hidden="true" />
      {children}
    </div>
  );
}

export default AppShell;
