import { motion } from "framer-motion";
import { Activity, FolderKanban, ShieldCheck } from "lucide-react";

function InsightsPanel({ insights }) {
  return (
    <section className="dashboard-panel-group">
      <div className="insights-grid">
        <motion.article
          className="panel insight-card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="insight-card__header">
            <span>Total contributions</span>
            <FolderKanban size={16} />
          </div>
          <strong>{insights.totalContributions}</strong>
        </motion.article>

        <motion.article
          className="panel insight-card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="insight-card__header">
            <span>Status breakdown</span>
            <ShieldCheck size={16} />
          </div>
          <div className="insight-breakdown">
            <span>Approved: {insights.approvedCount}</span>
            <span>Review: {insights.reviewCount}</span>
            <span>Progress: {insights.progressCount}</span>
          </div>
        </motion.article>

        <motion.article
          className="panel dashboard-card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="insight-card__header">
            <span>Most active domain</span>
            <Activity size={16} />
          </div>
          <h3>{insights.mostActiveDomain}</h3>
          <p>
            The dashboard is organized around technical domains so the work reads
            as engineering depth, not just a list of repositories.
          </p>
        </motion.article>
      </div>
    </section>
  );
}

export default InsightsPanel;
