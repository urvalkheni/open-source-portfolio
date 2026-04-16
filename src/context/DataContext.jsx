import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  appendActivity,
  appendBackup,
  createInitialStore,
  exportContributionsJson,
  finalizeStore,
  hydrateStore,
  persistStore,
  restoreBackupSnapshot,
} from "../services/storageService";
import {
  MAX_UNDO_ITEMS,
  computeDashboardMetrics,
  computeInsights,
  createContributionRecord,
  getFeaturedContributions,
  normalizeContributionCollection,
  sanitizeSettings,
  validateImportPayload,
} from "../services/validationService";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [store, setStore] = useState(() => createInitialStore());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [bootMessages, setBootMessages] = useState([]);
  const [recentlyTouchedIds, setRecentlyTouchedIds] = useState([]);
  const undoStackRef = useRef([]);
  const storeRef = useRef(store);
  const highlightTimeoutRef = useRef(null);

  useEffect(() => {
    const { store: hydratedStore, notes } = hydrateStore();

    storeRef.current = hydratedStore;
    setStore(hydratedStore);
    setBootMessages(notes);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    try {
      persistStore(store);
      setErrorMessage("");
    } catch {
      setErrorMessage("Unable to persist dashboard changes locally.");
    }
  }, [isLoading, store]);

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    },
    [],
  );

  function markRecentlyTouched(ids = []) {
    setRecentlyTouchedIds(ids);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    if (ids.length === 0) {
      return;
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setRecentlyTouchedIds([]);
    }, 10000);
  }

  function pushUndoSnapshot(label) {
    undoStackRef.current = [
      {
        label,
        snapshot: storeRef.current,
      },
      ...undoStackRef.current,
    ].slice(0, MAX_UNDO_ITEMS);
  }

  function commitStore(nextStore, options = {}) {
    const finalizedStore = finalizeStore(nextStore);

    if (options.undoLabel) {
      pushUndoSnapshot(options.undoLabel);
    }

    storeRef.current = finalizedStore;
    setStore(finalizedStore);
    markRecentlyTouched(options.highlightIds ?? []);

    return finalizedStore;
  }

  function addContribution(input) {
    try {
      const contribution = createContributionRecord(
        input,
        undefined,
        storeRef.current.contributions.length,
      );
      const nextStore = appendActivity(
        {
          ...storeRef.current,
          contributions: [contribution, ...storeRef.current.contributions],
        },
        "create",
        `Added "${contribution.title}" to the dashboard.`,
        { contributionId: contribution.id },
      );

      commitStore(nextStore, {
        undoLabel: "Added contribution",
        highlightIds: [contribution.id],
      });

      return { ok: true, message: "Contribution added successfully." };
    } catch {
      return { ok: false, message: "Unable to add contribution." };
    }
  }

  function updateContribution(contributionId, input) {
    const currentContribution = storeRef.current.contributions.find(
      (item) => item.id === contributionId,
    );

    if (!currentContribution) {
      return { ok: false, message: "Contribution not found." };
    }

    try {
      const updatedContribution = createContributionRecord(input, currentContribution);
      let nextStore = {
        ...storeRef.current,
        contributions: storeRef.current.contributions.map((item) =>
          item.id === contributionId ? updatedContribution : item,
        ),
      };
      nextStore = appendBackup(
        nextStore,
        `Before updating ${currentContribution.title}`,
        storeRef.current,
      );
      nextStore = appendActivity(
        nextStore,
        "update",
        `Updated "${updatedContribution.title}".`,
        { contributionId },
      );

      commitStore(nextStore, {
        undoLabel: "Updated contribution",
        highlightIds: [contributionId],
      });

      return { ok: true, message: "Contribution updated successfully." };
    } catch (error) {
      return {
        ok: false,
        message: error.message || "Unable to update contribution.",
      };
    }
  }

  function deleteContribution(contributionId) {
    const contribution = storeRef.current.contributions.find(
      (item) => item.id === contributionId,
    );

    if (!contribution) {
      return { ok: false, message: "Contribution not found." };
    }

    let nextStore = {
      ...storeRef.current,
      contributions: storeRef.current.contributions.filter(
        (item) => item.id !== contributionId,
      ),
    };
    nextStore = appendBackup(
      nextStore,
      `Before deleting ${contribution.title}`,
      storeRef.current,
    );
    nextStore = appendActivity(
      nextStore,
      "delete",
      `Deleted "${contribution.title}".`,
      { contributionId },
    );

    commitStore(nextStore, {
      undoLabel: "Deleted contribution",
      highlightIds: [],
    });

    return { ok: true, message: "Contribution deleted." };
  }

  function importContributions(payload) {
    try {
      const { contributions: importedContributions, settings: importedSettings } =
        validateImportPayload(payload);
      let nextStore = {
        ...storeRef.current,
        contributions: normalizeContributionCollection(importedContributions),
        settings: importedSettings
          ? sanitizeSettings({
              ...storeRef.current.settings,
              ...importedSettings,
            })
          : storeRef.current.settings,
      };
      nextStore = appendBackup(nextStore, "Before import", storeRef.current);
      nextStore = appendActivity(
        nextStore,
        "import",
        `Imported ${importedContributions.length} contributions from JSON.`,
      );

      commitStore(nextStore, {
        undoLabel: "Imported contributions",
        highlightIds: importedContributions.slice(0, 4).map((item) => item.id),
      });

      return {
        ok: true,
        message: `Imported ${importedContributions.length} contributions.`,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message || "Unable to import contributions.",
      };
    }
  }

  function restoreBackup(backupId) {
    const restoredStore = restoreBackupSnapshot(storeRef.current, backupId);

    if (!restoredStore) {
      return { ok: false, message: "Backup not found." };
    }

    let nextStore = appendBackup(restoredStore, "Before restore", storeRef.current);
    nextStore = appendActivity(
      nextStore,
      "restore",
      "Restored dashboard data from backup.",
    );

    commitStore(nextStore, {
      undoLabel: "Restored backup",
      highlightIds: restoredStore.contributions.slice(0, 4).map((item) => item.id),
    });

    return { ok: true, message: "Backup restored successfully." };
  }

  function updateSettings(nextSettings) {
    const resolvedSettings = sanitizeSettings({
      ...storeRef.current.settings,
      ...nextSettings,
    });
    const nextStore = appendActivity(
      {
        ...storeRef.current,
        settings: resolvedSettings,
      },
      "settings",
      resolvedSettings.allowContentCopying
        ? "Enabled content copying."
        : "Enabled copy deterrence protections.",
    );

    commitStore(nextStore, {
      undoLabel: "Updated settings",
    });

    return { ok: true, message: "Security setting updated." };
  }

  function undoLastAction() {
    const [latestUndo, ...remaining] = undoStackRef.current;

    if (!latestUndo) {
      return { ok: false, message: "Nothing to undo." };
    }

    undoStackRef.current = remaining;

    const nextStore = appendActivity(
      latestUndo.snapshot,
      "undo",
      `Undid: ${latestUndo.label}.`,
    );

    commitStore(nextStore, {
      highlightIds: [],
    });

    return { ok: true, message: `Undid: ${latestUndo.label}.` };
  }

  function exportDashboardJson() {
    return exportContributionsJson(
      storeRef.current.contributions,
      storeRef.current.settings,
    );
  }

  const metrics = useMemo(
    () => computeDashboardMetrics(store.contributions),
    [store.contributions],
  );
  const featuredContributions = useMemo(
    () => getFeaturedContributions(store.contributions),
    [store.contributions],
  );
  const insights = useMemo(
    () => computeInsights(store.contributions, store.activityLog),
    [store.activityLog, store.contributions],
  );

  const clearBootMessages = useCallback(() => {
    setBootMessages([]);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      errorMessage,
      bootMessages,
      metrics,
      contributions: store.contributions,
      backups: store.backups,
      settings: store.settings,
      activityLog: store.activityLog,
      insights,
      featuredContributions,
      recentlyTouchedIds,
      hasUndo: undoStackRef.current.length > 0,
      addContribution,
      updateContribution,
      deleteContribution,
      importContributions,
      restoreBackup,
      updateSettings,
      undoLastAction,
      exportDashboardJson,
      clearBootMessages,
    }),
    [
      bootMessages,
      errorMessage,
      featuredContributions,
      insights,
      isLoading,
      metrics,
      recentlyTouchedIds,
      store.activityLog,
      store.backups,
      store.contributions,
      store.settings,
      clearBootMessages,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider.");
  }

  return context;
}
