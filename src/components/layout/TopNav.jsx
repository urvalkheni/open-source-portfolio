import { Github, LockKeyhole, ShieldCheck } from "lucide-react";
import Button from "../ui/Button";

const navItems = [
  { label: "Impact", href: "#impact" },
  { label: "Contributions", href: "#contributions" },
  { label: "Skills", href: "#skills" },
];

function TopNav({
  isAdminAuthenticated,
  sessionCountdownLabel,
}) {
  return (
    <header className="top-nav">
      <div className="container top-nav__inner">
        <a
          className="brand"
          href="#hero"
          aria-label="Urval home"
          onDoubleClick={() => {
            window.dispatchEvent(new CustomEvent("dashboard:open-admin"));
          }}
        >
          <span className="brand__mark">U</span>
          <span>
            Urval
            <small>Systems Engineering Contributions</small>
          </span>
        </a>

        <nav className="top-nav__links" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <Button
          as="a"
          href="https://github.com/urvalkheni"
          target="_blank"
          rel="noreferrer"
          variant="ghost"
          icon={<Github size={16} />}
        >
          GitHub
        </Button>
      </div>

      <div className="container top-nav__signal">
        <div className="top-nav__status-row">
          <span className="signal-pill">
            <ShieldCheck size={14} />
            Open source systems engineering
          </span>
          {isAdminAuthenticated ? (
            <span className="signal-pill signal-pill--active">
              <LockKeyhole size={14} />
              Admin session {sessionCountdownLabel}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default TopNav;
