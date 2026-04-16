import { Clock3, Copy, RotateCcw, Shield, Upload } from "lucide-react";
import { formatTimestamp } from "../../services/securityService";
import Button from "../ui/Button";

function AdminPanel({
  isAuthenticated,
  sessionCountdownLabel,
  isCopyProtectionActive,
  allowContentCopying,
  hasUndo,
  backups,
  onLogin,
  onLogout,
  onToggleCopying,
  onUndo,
  onRestoreBackup,
  onImport,
}) {
  return (
    <section className="dashboard-secondary-grid dashboard-secondary-grid--admin">
      <article className="panel dashboard-card">
        <div className="dashboard-card__title-row">
          <div>
            <p className="panel-label">Admin Control</p>
            <h3>{isAuthenticated ? "Protected session active" : "Read-only session"}</h3>
          </div>
          <span className={`signal-pill ${isAuthenticated ? "signal-pill--active" : ""}`.trim()}>
            <Shield size={14} />
            {isAuthenticated ? "Admin unlocked" : "Locked"}
          </span>
        </div>

        <div className="admin-panel__metrics">
          <div className="admin-metric">
            <Clock3 size={16} />
            <div>
              <span>Session timer</span>
              <strong>{isAuthenticated ? sessionCountdownLabel : "00:00"}</strong>
            </div>
          </div>
          <div className="admin-metric">
            <Copy size={16} />
            <div>
              <span>Copy protection</span>
              <strong>{isCopyProtectionActive ? "Deterrence on" : "Copying allowed"}</strong>
            </div>
          </div>
        </div>

        <div className="admin-panel__actions">
          {isAuthenticated ? (
            <Button variant="ghost" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="ghost" onClick={onLogin}>
              Admin Login
            </Button>
          )}

          <Button
            variant="secondary"
            icon={<RotateCcw size={15} />}
            disabled={!isAuthenticated || !hasUndo}
            onClick={onUndo}
          >
            Undo last action
          </Button>

          <Button
            variant="secondary"
            icon={<Upload size={15} />}
            disabled={!isAuthenticated}
            onClick={onImport}
          >
            Import JSON
          </Button>
        </div>

        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={allowContentCopying}
            disabled={!isAuthenticated}
            onChange={(event) => onToggleCopying(event.target.checked)}
          />
          <div>
            <strong>Allow Content Copying</strong>
            <span>
              When disabled, the dashboard applies light copy deterrence controls.
            </span>
          </div>
        </label>
      </article>

      <article className="panel dashboard-card">
        <p className="panel-label">Restore Backup</p>
        <h3>Recovery snapshots</h3>
        <div className="backup-list">
          {backups.length > 0 ? (
            backups.map((backup) => (
              <div key={backup.id} className="backup-list__item">
                <div>
                  <strong>{backup.label}</strong>
                  <span>{formatTimestamp(backup.createdAt)}</span>
                </div>
                <Button
                  variant="ghost"
                  disabled={!isAuthenticated}
                  onClick={() => onRestoreBackup(backup.id)}
                >
                  Restore
                </Button>
              </div>
            ))
          ) : (
            <p>No backups yet. Delete, import, restore, and update actions generate backups automatically.</p>
          )}
        </div>
      </article>
    </section>
  );
}

export default AdminPanel;
