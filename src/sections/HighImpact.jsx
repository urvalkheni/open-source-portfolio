import { motion } from "framer-motion";
import ImpactCard from "../components/cards/ImpactCard";
import SectionHeading from "../components/ui/SectionHeading";
import { featuredContributions } from "../data/contributions";

function HighImpact() {
  return (
    <section className="section" id="impact">
      <div className="container">
        <SectionHeading
          eyebrow="High Impact Work"
          title="Security-relevant upstream changes with visible engineering leverage"
          description="These featured contributions are the highest-signal examples of systems work: hardening packet parsing, preserving analyzer correctness, and improving runtime behavior in traffic paths defenders rely on."
        />

        <motion.div
          className="impact-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {featuredContributions.map((contribution) => (
            <ImpactCard key={contribution.id} contribution={contribution} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default HighImpact;
