import { getStatusKey } from "../../data/contributions";

const statusClassMap = {
  approved: "status-badge status-badge--approved",
  "under-review": "status-badge status-badge--review",
  "in-progress": "status-badge status-badge--progress",
};

function StatusBadge({ status, statusKey }) {
  const resolvedStatusKey = statusKey ?? getStatusKey(status);

  return (
    <span className={statusClassMap[resolvedStatusKey] ?? statusClassMap["in-progress"]}>
      {status}
    </span>
  );
}

export default StatusBadge;
