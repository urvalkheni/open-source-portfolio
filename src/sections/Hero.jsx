import { motion } from "framer-motion";
import { ArrowDownRight, Github, Shield, Workflow } from "lucide-react";
import Button from "../components/ui/Button";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function Hero({ metrics, isLoading }) {
  return (
    <section className="hero" id="hero">
      <div className="container hero__grid">
        <motion.div
          className="hero__content"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <span className="eyebrow">Engineering Contributions</span>
          <h1>Urval</h1>
          <p className="hero__title">
            Open Source Contributor | Systems & Security Engineering
          </p>
          <p className="hero__tagline">
            I build and debug real-world systems through open source contributions.
          </p>
          <p className="hero__focus">
            Focused on:
            <span>Network Security</span>
            <span>Kernel-Level Systems</span>
            <span>Protocol Analysis</span>
          </p>
          <p className="hero__description">
            This project is a structured record of upstream engineering work
            across Suricata, Zeek, and Linux networking. It focuses on the kind
            of work teams actually care about: parser correctness, observability,
            debugging depth, and changes that improve how real systems behave.
          </p>
          <p className="hero__trust">
            Some contributions are currently under review in active open-source projects.
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
                <strong>Security tooling, protocol analysis, and kernel-adjacent networking</strong>
              </div>
            </div>
            <div className="hero-panel__item">
              <Workflow size={18} />
              <div>
                <span>What this dashboard shows</span>
                <strong>Real contribution impact, technical context, and the engineering lessons behind the work</strong>
              </div>
            </div>
          </div>

          <div className="hero-panel__metrics">
            {(isLoading ? [] : metrics).map((metric) => (
              <div key={metric.label} className="hero-panel__metric">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
            {isLoading ? (
              <div className="hero-panel__metric hero-panel__metric--wide">
                <strong>...</strong>
                <span>Loading hardened local workspace</span>
              </div>
            ) : null}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

export default Hero;
