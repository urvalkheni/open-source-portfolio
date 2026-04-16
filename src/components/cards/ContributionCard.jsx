import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  FolderKanban,
  History,
  Pencil,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { formatTimestamp } from "../../services/securityService";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

function ContributionCard({
  contribution,
  canManage,
  onEdit,
  onDelete,
  isRecentlyTouched,
}) {
  const [isLearningsOpen, setIsLearningsOpen] = useState(false);
  const hasValidLink = Boolean(contribution.link);

  return (
    <motion.article
      layout
      className={`panel contribution-card ${
        isRecentlyTouched ? "contribution-card--recent" : ""
      }`.trim()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="contribution-card__top">
        <div>
          <p className="panel-label">{contribution.project}</p>
          <h3>{contribution.title}</h3>
        </div>
        <div className="contribution-card__top-actions">
          {canManage ? (
            <div className="contribution-card__admin-actions">
              <button
                type="button"
                className="icon-button"
                aria-label={`Edit ${contribution.title}`}
                disabled={!canManage}
                onClick={() => onEdit(contribution)}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                className="icon-button icon-button--danger"
                aria-label={`Delete ${contribution.title}`}
                disabled={!canManage}
                onClick={() => onDelete(contribution)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ) : null}
          <StatusBadge
            status={contribution.status}
            statusKey={contribution.statusKey}
          />
        </div>
      </div>

      <p>{contribution.description}</p>

      <div className="contribution-card__meta">
        <span>
          <FolderKanban size={15} />
          {contribution.area || "General"}
        </span>
        <span>
          <CalendarDays size={15} />
          {contribution.date || "Date TBD"}
        </span>
        <span>
          <History size={15} />
          Updated {formatTimestamp(contribution.updatedAt)}
        </span>
      </div>

      <div className="contribution-card__impact">
        <strong>Impact</strong>
        <p>{contribution.impact}</p>
      </div>

      <div className="contribution-card__learnings">
        <button
          type="button"
          className={`contribution-card__learn-toggle ${
            isLearningsOpen ? "is-open" : ""
          }`.trim()}
          onClick={() => setIsLearningsOpen((current) => !current)}
        >
          <span>What I Learned</span>
          <ChevronDown size={16} />
        </button>

        <AnimatePresence initial={false}>
          {isLearningsOpen ? (
            <motion.div
              className="contribution-card__learn-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <p>{contribution.learnings}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="contribution-card__footer">
        <span className="contribution-card__project">{contribution.project}</span>
        {hasValidLink ? (
          <Button
            as="a"
            href={contribution.link}
            target="_blank"
            rel="noreferrer noopener"
            variant="secondary"
            icon={<ArrowUpRight size={15} />}
          >
            View PR
          </Button>
        ) : (
          <Button variant="secondary" disabled>
            Link unavailable
          </Button>
        )}
      </div>
    </motion.article>
  );
}

export default ContributionCard;
