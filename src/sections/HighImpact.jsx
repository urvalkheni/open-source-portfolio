import { motion } from "framer-motion";
import ImpactCard from "../components/cards/ImpactCard";
import SectionHeading from "../components/ui/SectionHeading";

function HighImpact({ contributions }) {
  return (
    <section className="section" id="impact">
      <div className="container">
        <SectionHeading
          eyebrow="High Impact Work"
          title="The strongest examples of engineering impact"
          description="These are the contributions I would want a recruiter or engineering manager to see first: technically specific changes, clear operational value, and evidence of real debugging depth."
        />
        <p className="section-note">
          Each highlighted contribution answers the same question: why should an
          engineering team care about this change in a real system?
        </p>

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
          {contributions.length > 0 ? (
            contributions.map((contribution) => (
              <ImpactCard key={contribution.id} contribution={contribution} />
            ))
          ) : (
            <div className="panel empty-state empty-state--compact">
              <h3>No featured contributions yet</h3>
              <p>
                Add contributions in edit mode and your highest-signal work will
                appear here automatically.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default HighImpact;
