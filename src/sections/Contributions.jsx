import { AnimatePresence, motion } from "framer-motion";
import ContributionCard from "../components/cards/ContributionCard";
import FilterTabs from "../components/ui/FilterTabs";
import SectionHeading from "../components/ui/SectionHeading";
import { contributionFilters, contributions } from "../data/contributions";
import { useContributionFilter } from "../hooks/useContributionFilter";

function Contributions() {
  const { activeFilter, setActiveFilter, filteredItems } =
    useContributionFilter(contributions);

  return (
    <section className="section" id="contributions">
      <div className="container">
        <SectionHeading
          eyebrow="Contribution Pipeline"
          title="Tracked by engineering state, not just screenshots"
          description="Each contribution is presented as a live engineering artifact with technical scope, repository context, and review status. The result feels closer to a systems dashboard than a traditional portfolio."
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
        >
          <FilterTabs
            items={contributionFilters}
            activeFilter={activeFilter}
            onChange={setActiveFilter}
          />
        </motion.div>

        <motion.div layout className="contribution-grid">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((contribution) => (
              <ContributionCard
                key={contribution.id}
                contribution={contribution}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

export default Contributions;
