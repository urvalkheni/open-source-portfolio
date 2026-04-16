import { ArrowUpRight, CalendarDays, Radar } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

const cardMotion = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function ImpactCard({ contribution }) {
  return (
    <motion.article
      className="panel impact-card"
      variants={cardMotion}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -8 }}
    >
      <div className="impact-card__header">
        <div>
          <p className="panel-label">{contribution.project}</p>
          <h3>{contribution.title}</h3>
        </div>
        <StatusBadge
          status={contribution.status}
          statusKey={contribution.statusKey}
        />
      </div>

      <p className="impact-card__body">{contribution.impact}</p>

      <div className="impact-card__why">
        <strong>Why it matters</strong>
        <p>{contribution.description}</p>
      </div>

      <div className="impact-card__meta">
        <span>
          <Radar size={15} />
          {contribution.area}
        </span>
        <span>
          <CalendarDays size={15} />
          {contribution.date || "Date TBD"}
        </span>
      </div>

      <Button
        as="a"
        href={contribution.link}
        target="_blank"
        rel="noreferrer noopener"
        variant="secondary"
        icon={<ArrowUpRight size={16} />}
      >
        View PR
      </Button>
    </motion.article>
  );
}

export default ImpactCard;
