import { ArrowUpRight, GitPullRequest } from "lucide-react";
import { motion } from "framer-motion";
import StatusBadge from "../ui/StatusBadge";

function ContributionCard({ contribution }) {
  return (
    <motion.article
      layout
      className="panel contribution-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="contribution-card__top">
        <div className="contribution-card__repo">
          <GitPullRequest size={15} />
          <span>{contribution.repo}</span>
        </div>
        <StatusBadge
          status={contribution.status}
          statusKey={contribution.statusKey}
        />
      </div>

      <h3>{contribution.title}</h3>
      <p>{contribution.description}</p>

      <div className="contribution-card__footer">
        <span className="contribution-card__project">{contribution.project}</span>
        <a href={contribution.link} target="_blank" rel="noreferrer">
          View PR
          <ArrowUpRight size={15} />
        </a>
      </div>
    </motion.article>
  );
}

export default ContributionCard;
