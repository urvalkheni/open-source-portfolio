import { Github, ShieldCheck } from "lucide-react";
import Button from "../ui/Button";

const navItems = [
  { label: "Impact", href: "#impact" },
  { label: "Contributions", href: "#contributions" },
  { label: "Skills", href: "#skills" },
];

function TopNav() {
  return (
    <header className="top-nav">
      <div className="container top-nav__inner">
        <a className="brand" href="#hero" aria-label="Urval home">
          <span className="brand__mark">U</span>
          <span>
            Urval
            <small>Contribution Intelligence Dashboard</small>
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
          href="https://github.com/Urval"
          target="_blank"
          rel="noreferrer"
          variant="ghost"
          icon={<Github size={16} />}
        >
          GitHub
        </Button>
      </div>

      <div className="container top-nav__signal">
        <span className="signal-pill">
          <ShieldCheck size={14} />
          Security-first upstream engineering
        </span>
      </div>
    </header>
  );
}

export default TopNav;
