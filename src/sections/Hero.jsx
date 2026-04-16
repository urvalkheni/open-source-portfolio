import { motion } from "framer-motion";
import { ArrowDownRight, Github, Shield, Workflow } from "lucide-react";
import Button from "../components/ui/Button";
import { dashboardMetrics } from "../data/contributions";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container hero__grid">
        <motion.div
          className="hero__content"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <span className="eyebrow">Contribution Intelligence Dashboard</span>
          <h1>Urval</h1>
          <p className="hero__title">
            Open Source Contributor | Cybersecurity Engineer
          </p>
          <p className="hero__tagline">
            Building and securing systems through real-world contributions
          </p>
          <p className="hero__description">
            This dashboard highlights upstream work across IDS/IPS pipelines,
            protocol analyzers, and Linux networking paths. The focus is on
            contribution quality that matters to engineering teams: parser
            resilience, debugging depth, operational clarity, and impact on
            real defensive systems.
          </p>

          <div className="hero__actions">
            <Button
              as="a"
              href="https://github.com/Urval"
              target="_blank"
              rel="noreferrer"
              icon={<Github size={16} />}
            >
              View GitHub
            </Button>
            <Button as="a" href="#impact" variant="secondary" icon={<ArrowDownRight size={16} />}>
              Explore high impact work
            </Button>
          </div>
        </motion.div>

        <motion.aside
          className="panel hero-panel"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <div className="hero-panel__stack">
            <div className="hero-panel__item">
              <Shield size={18} />
              <div>
                <span>Primary focus</span>
                <strong>Security tooling, parser hardening, kernel-adjacent networking</strong>
              </div>
            </div>
            <div className="hero-panel__item">
              <Workflow size={18} />
              <div>
                <span>Engineering lens</span>
                <strong>Impact-first upstream changes with reproducible technical reasoning</strong>
              </div>
            </div>
          </div>

          <div className="hero-panel__metrics">
            {dashboardMetrics.map((metric) => (
              <div key={metric.label} className="hero-panel__metric">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

export default Hero;
