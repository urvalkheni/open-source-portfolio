const statusClassMap = {
  approved: "status-badge status-badge--approved",
  "under-review": "status-badge status-badge--review",
  "in-progress": "status-badge status-badge--progress",
};

function StatusBadge({ status, statusKey }) {
  return <span className={statusClassMap[statusKey]}>{status}</span>;
}

export default StatusBadge;
