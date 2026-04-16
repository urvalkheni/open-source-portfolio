import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  FileUp,
  LogOut,
  Plus,
  Search,
} from "lucide-react";
import AdminPanel from "../components/dashboard/AdminPanel";
import ContributionCard from "../components/cards/ContributionCard";
import AdminLoginForm from "../components/forms/AdminLoginForm";
import ContributionForm from "../components/forms/ContributionForm";
import ConfirmModal from "../components/modals/ConfirmModal";
import Modal from "../components/modals/Modal";
import Button from "../components/ui/Button";
import FilterTabs from "../components/ui/FilterTabs";
import SectionHeading from "../components/ui/SectionHeading";
import { useAuthContext } from "../context/AuthContext";
import { useDataContext } from "../context/DataContext";
import { useUIContext } from "../context/UIContext";
import { useContributionFilter } from "../hooks/useContributionFilter";
import {
  CONTRIBUTION_FILTERS,
  MAX_IMPORT_FILE_BYTES,
} from "../services/validationService";

function Contributions() {
  const auth = useAuthContext();
  const data = useDataContext();
  const ui = useUIContext();
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredItems,
  } = useContributionFilter(data.contributions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const fileInputRef = useRef(null);
  const recentIds = useMemo(
    () => new Set(data.recentlyTouchedIds),
    [data.recentlyTouchedIds],
  );
  const isAdminMode = auth.isAuthenticated;
  const isFiltered = activeFilter !== "all" || Boolean(searchQuery.trim());

  useEffect(() => {
    const openAdminAccess = () => {
      setAuthError("");
      setIsLoginModalOpen(true);
    };
    const handleShortcut = (event) => {
      const isAdminShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "a";

      if (!isAdminShortcut) {
        return;
      }

      event.preventDefault();
      openAdminAccess();
    };

    window.addEventListener("dashboard:open-admin", openAdminAccess);
    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("dashboard:open-admin", openAdminAccess);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  function ensureAdmin(message) {
    if (isAdminMode) {
      return true;
    }

    ui.addToast(message, "error");
    setAuthError("");
    setIsLoginModalOpen(true);
    return false;
  }

  function closeEditor() {
    setEditingContribution(null);
    setIsModalOpen(false);
  }

  function handleOpenCreate() {
    if (!ensureAdmin("Admin login is required to add contributions.")) {
      return;
    }

    setEditingContribution(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(contribution) {
    if (!ensureAdmin("Admin login is required to edit contributions.")) {
      return;
    }

    auth.registerActivity();
    setEditingContribution(contribution);
    setIsModalOpen(true);
  }

  function handleSaveContribution(values) {
    if (!ensureAdmin("Admin login is required to save changes.")) {
      return;
    }

    auth.registerActivity();
    const result = editingContribution
      ? data.updateContribution(editingContribution.id, values)
      : data.addContribution(values);

    if (!result.ok) {
      ui.addToast(result.message, "error");
      return;
    }

    closeEditor();
    ui.addToast(result.message);
  }

  function handleExport() {
    const blob = new Blob([data.exportDashboardJson()], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "urval-dashboard-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
    ui.addToast("Dashboard exported as JSON.");
  }

  function handleImportClick() {
    if (!ensureAdmin("Admin login is required to import contributions.")) {
      return;
    }

    auth.registerActivity();
    fileInputRef.current?.click();
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      ui.addToast("Import file is too large. Use a JSON file under 512 KB.", "error");
      return;
    }

    if (!ensureAdmin("Admin login is required to import contributions.")) {
      return;
    }

    auth.registerActivity();

    try {
      const parsed = JSON.parse(await file.text());

      setPendingAction({
        title: "Import dashboard JSON",
        description:
          "Importing replaces your current browser-stored contributions and may update dashboard settings from the file.",
        confirmLabel: "Import JSON",
        run: () => {
          const result = data.importContributions(parsed);

          if (!result.ok) {
            ui.addToast(result.message, "error");
            return;
          }

          setActiveFilter("all");
          setSearchQuery("");
          ui.addToast(result.message);
        },
      });
    } catch (error) {
      ui.addToast(error.message || "Unable to import contributions JSON.", "error");
    }
  }

  async function handleAdminLogin(pin) {
    setAuthError("");
    setIsAuthenticating(true);

    try {
      const result = await auth.login(pin);

      if (!result.ok) {
        setAuthError(result.error);
        return;
      }

      setIsLoginModalOpen(false);
      ui.addToast("Admin mode enabled for this session.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleLogout() {
    auth.logout("manual");
    closeEditor();
    setIsLoginModalOpen(false);
    ui.addToast("Admin session ended.");
  }

  function handleDeleteContribution(contribution) {
    if (!ensureAdmin("Admin login is required to delete contributions.")) {
      return;
    }

    setPendingAction({
      title: `Delete ${contribution.title}?`,
      description:
        "This removes the contribution from your current dashboard and creates a recovery backup first.",
      confirmLabel: "Delete contribution",
      run: () => {
        auth.registerActivity();
        const result = data.deleteContribution(contribution.id);
        ui.addToast(result.message, result.ok ? "success" : "error");
      },
    });
  }

  function handleRestoreBackup(backupId) {
    if (!ensureAdmin("Admin login is required to restore backups.")) {
      return;
    }

    setPendingAction({
      title: "Restore backup snapshot?",
      description:
        "The current dashboard state will be preserved as a new backup before the restore runs.",
      confirmLabel: "Restore backup",
      run: () => {
        auth.registerActivity();
        const result = data.restoreBackup(backupId);
        ui.addToast(result.message, result.ok ? "success" : "error");
      },
    });
  }

  function handleUndo() {
    if (!ensureAdmin("Admin login is required to undo changes.")) {
      return;
    }

    auth.registerActivity();
    const result = data.undoLastAction();
    ui.addToast(result.message, result.ok ? "success" : "error");
  }

  function handleToggleCopying(allowContentCopying) {
    if (!ensureAdmin("Admin login is required to change security settings.")) {
      return;
    }

    auth.registerActivity();
    const result = data.updateSettings({ allowContentCopying });
    ui.addToast(result.message, result.ok ? "success" : "error");
  }

  function closeLoginModal() {
    setIsLoginModalOpen(false);
    setAuthError("");
  }

  function confirmPendingAction() {
    pendingAction?.run?.();
    setPendingAction(null);
  }

  return (
    <section className="section" id="contributions">
      <div className="container">
        <SectionHeading
          eyebrow="Selected Contributions"
          title="Real engineering work, organized for fast understanding"
          description="Each entry captures the technical change, the operational impact, and the engineering lesson behind it so the work is easy to understand quickly."
        />

        <motion.div
          className="contribution-toolbar"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
        >
          <label className="search-field">
            <Search size={17} />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by project or title"
              aria-label="Search contributions"
            />
          </label>

          <div className="contribution-toolbar__actions">
            {isAdminMode ? (
              <Button
                variant="primary"
                icon={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : null}

            {isAdminMode ? (
              <Button icon={<Plus size={16} />} onClick={handleOpenCreate}>
                Add Contribution
              </Button>
            ) : null}
            {isAdminMode ? (
              <Button
                variant="secondary"
                icon={<Download size={16} />}
                onClick={handleExport}
              >
                Export JSON
              </Button>
            ) : null}
            {isAdminMode ? (
              <Button
                variant="secondary"
                icon={<FileUp size={16} />}
                onClick={handleImportClick}
              >
                Import JSON
              </Button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={handleImport}
            />
          </div>
        </motion.div>

        {isAdminMode ? (
          <AdminPanel
            isAuthenticated={isAdminMode}
            sessionCountdownLabel={auth.sessionCountdownLabel}
            isCopyProtectionActive={ui.isCopyProtectionActive}
            allowContentCopying={data.settings.allowContentCopying}
            hasUndo={data.hasUndo}
            backups={data.backups}
            onLogin={() => {
              setAuthError("");
              setIsLoginModalOpen(true);
            }}
            onLogout={handleLogout}
            onToggleCopying={handleToggleCopying}
            onUndo={handleUndo}
            onRestoreBackup={handleRestoreBackup}
            onImport={handleImportClick}
          />
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
        >
          <FilterTabs
            items={CONTRIBUTION_FILTERS}
            activeFilter={activeFilter}
            onChange={setActiveFilter}
          />
        </motion.div>

        <div className="contribution-results">
          <span>
            {filteredItems.length} contribution{filteredItems.length === 1 ? "" : "s"}
          </span>
          <span>
            {isAdminMode ? "Admin tools unlocked for this session" : "Search by project or title"}
          </span>
        </div>

        {data.isLoading ? (
          <div className="panel empty-state">
            <h3>Loading contribution workspace</h3>
            <p>
              Hydrating versioned local storage, integrity checks, and recovery
              snapshots.
            </p>
          </div>
        ) : (
          <motion.div layout className="contribution-grid">
            <AnimatePresence mode="popLayout">
              {filteredItems.length > 0 ? (
                filteredItems.map((contribution) => (
                  <ContributionCard
                    key={contribution.id}
                    contribution={contribution}
                    canManage={isAdminMode}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteContribution}
                    isRecentlyTouched={recentIds.has(contribution.id)}
                  />
                ))
              ) : (
                <motion.div
                  layout
                  className="panel empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                >
                  <h3>No contributions yet</h3>
                  <p>
                    {isFiltered
                      ? "Try a different filter or search term to surface more work."
                      : "Unlock admin mode to add your first contribution and start building a durable engineering record."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <Modal
          isOpen={isModalOpen}
          title={editingContribution ? "Edit contribution" : "Add contribution"}
          description="Changes are validated, sanitized, versioned, and saved directly in the browser."
          onClose={closeEditor}
        >
          <ContributionForm
            initialValues={editingContribution}
            onSubmit={handleSaveContribution}
            onCancel={closeEditor}
          />
        </Modal>

        <Modal
          isOpen={isLoginModalOpen}
          title="Admin login"
          description="Unlock protected actions with your local admin PIN. The session lives only in memory and expires after inactivity."
          onClose={closeLoginModal}
        >
          <AdminLoginForm
            onSubmit={handleAdminLogin}
            onCancel={closeLoginModal}
            isSubmitting={isAuthenticating}
            errorMessage={authError}
          />
        </Modal>

        <ConfirmModal
          isOpen={Boolean(pendingAction)}
          title={pendingAction?.title || ""}
          description={pendingAction?.description || ""}
          confirmLabel={pendingAction?.confirmLabel || "Confirm"}
          onConfirm={confirmPendingAction}
          onClose={() => setPendingAction(null)}
        />
      </div>
    </section>
  );
}

export default Contributions;
