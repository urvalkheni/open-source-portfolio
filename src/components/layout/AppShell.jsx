function AppShell({
  children,
  isCopyProtectionActive = false,
  isContentObscured = false,
}) {
  return (
    <div
      className={`app-shell ${isCopyProtectionActive ? "app-shell--copy-locked" : ""} ${
        isContentObscured ? "app-shell--obscured" : ""
      }`.trim()}
    >
      <div className="app-shell__noise" aria-hidden="true" />
      <div className="app-shell__grid" aria-hidden="true" />
      <div className="app-shell__content">{children}</div>
    </div>
  );
}

export default AppShell;
