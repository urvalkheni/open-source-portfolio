import { defaultContributions } from "../data/contributions";
import {
  createImmutableState,
  deepClone,
  sanitizePlainText,
} from "./securityService";
import {
  DEFAULT_SETTINGS,
  MAX_ACTIVITY_ITEMS,
  MAX_BACKUPS,
  STORAGE_SCHEMA_VERSION,
  createContributionRecord,
  normalizeContributionCollection,
  sanitizeSettings,
} from "./validationService";

const STORAGE_KEY = "urval-dashboard-store";
const LEGACY_STORAGE_KEY = "urval-contributions";

function createActivityEntry(type, message, details = {}) {
  return {
    id: crypto.randomUUID?.() ?? `activity-${Date.now()}`,
    type,
    message: sanitizePlainText(message, { maxLength: 180 }),
    timestamp: new Date().toISOString(),
    details,
  };
}

function limitActivityLog(items = []) {
  return items.slice(0, MAX_ACTIVITY_ITEMS);
}

function createBackupEntry(store, label) {
  return {
    id: crypto.randomUUID?.() ?? `backup-${Date.now()}`,
    label: sanitizePlainText(label, { maxLength: 100 }),
    createdAt: new Date().toISOString(),
    snapshot: {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      contributions: deepClone(store.contributions),
      settings: deepClone(store.settings),
      activityLog: deepClone(limitActivityLog(store.activityLog)),
      meta: deepClone(store.meta),
    },
  };
}

function sanitizeActivityLog(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return limitActivityLog(
    items
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id:
          sanitizePlainText(item.id, { maxLength: 120 }) ||
          crypto.randomUUID?.() ||
          `activity-${Date.now()}`,
        type: sanitizePlainText(item.type, { maxLength: 40 }) || "system",
        message:
          sanitizePlainText(item.message, { maxLength: 180 }) ||
          "Activity recorded",
        timestamp: item.timestamp || new Date().toISOString(),
      })),
  );
}

function sanitizeBackups(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item === "object" && item.snapshot)
    .slice(0, MAX_BACKUPS)
    .map((item) => ({
      id:
        sanitizePlainText(item.id, { maxLength: 120 }) ||
        crypto.randomUUID?.() ||
        `backup-${Date.now()}`,
      label: sanitizePlainText(item.label, { maxLength: 100 }) || "Recovered backup",
      createdAt: item.createdAt || new Date().toISOString(),
      snapshot: {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        contributions: normalizeContributionCollection(item.snapshot.contributions),
        settings: sanitizeSettings(item.snapshot.settings),
        activityLog: sanitizeActivityLog(item.snapshot.activityLog),
        meta:
          item.snapshot.meta && typeof item.snapshot.meta === "object"
            ? {
                lastModifiedAt:
                  item.snapshot.meta.lastModifiedAt || new Date().toISOString(),
              }
            : {
                lastModifiedAt: new Date().toISOString(),
              },
      },
    }));
}

function buildSeedContributions() {
  return normalizeContributionCollection(
    defaultContributions.map((item, index) =>
      createContributionRecord(
        {
          ...item,
          createdAt: item.date
            ? new Date(`${item.date}T12:00:00.000Z`).toISOString()
            : new Date().toISOString(),
          updatedAt: item.date
            ? new Date(`${item.date}T12:00:00.000Z`).toISOString()
            : new Date().toISOString(),
        },
        undefined,
        index,
      ),
    ),
  );
}

export function createInitialStore() {
  return createImmutableState({
    schemaVersion: STORAGE_SCHEMA_VERSION,
    contributions: buildSeedContributions(),
    backups: [],
    settings: DEFAULT_SETTINGS,
    activityLog: [
      createActivityEntry(
        "system",
        "Initialized versioned local dashboard storage.",
      ),
    ],
    meta: {
      lastModifiedAt: new Date().toISOString(),
    },
  });
}

function migrateRawStore(rawValue) {
  if (Array.isArray(rawValue)) {
    return {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      contributions: normalizeContributionCollection(rawValue),
      backups: [],
      settings: DEFAULT_SETTINGS,
      activityLog: [
        createActivityEntry(
          "migration",
          "Migrated legacy contribution array into versioned dashboard storage.",
        ),
      ],
      meta: {
        lastModifiedAt: new Date().toISOString(),
      },
    };
  }

  if (rawValue && typeof rawValue === "object") {
    return {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      contributions: normalizeContributionCollection(rawValue.contributions),
      backups: sanitizeBackups(rawValue.backups),
      settings: sanitizeSettings(rawValue.settings),
      activityLog: sanitizeActivityLog(rawValue.activityLog),
      meta: {
        lastModifiedAt:
          rawValue.meta?.lastModifiedAt || new Date().toISOString(),
      },
    };
  }

  return createInitialStore();
}

export function hydrateStore() {
  const notes = [];

  if (typeof window === "undefined") {
    return {
      store: createInitialStore(),
      notes,
    };
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (storedValue) {
      return {
        store: createImmutableState(migrateRawStore(JSON.parse(storedValue))),
        notes,
      };
    }

    const legacyValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);

    if (legacyValue) {
      notes.push(
        "Migrated legacy local contribution data to the hardened storage engine.",
      );

      return {
        store: createImmutableState(migrateRawStore(JSON.parse(legacyValue))),
        notes,
      };
    }
  } catch {
    notes.push(
      "Recovered from corrupted local storage and reloaded the default dashboard.",
    );
  }

  return {
    store: createInitialStore(),
    notes,
  };
}

export function persistStore(store) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deepClone(store)));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function finalizeStore(store) {
  return createImmutableState({
    ...deepClone(store),
    schemaVersion: STORAGE_SCHEMA_VERSION,
    contributions: normalizeContributionCollection(store.contributions),
    backups: sanitizeBackups(store.backups),
    settings: sanitizeSettings(store.settings),
    activityLog: sanitizeActivityLog(store.activityLog),
    meta: {
      lastModifiedAt: new Date().toISOString(),
    },
  });
}

export function appendActivity(store, type, message, details = {}) {
  return {
    ...store,
    activityLog: limitActivityLog([
      createActivityEntry(type, message, details),
      ...store.activityLog,
    ]),
  };
}

export function appendBackup(store, label, sourceStore) {
  return {
    ...store,
    backups: [createBackupEntry(sourceStore, label), ...store.backups].slice(
      0,
      MAX_BACKUPS,
    ),
  };
}

export function restoreBackupSnapshot(currentStore, backupId) {
  const backup = currentStore.backups.find((item) => item.id === backupId);

  if (!backup) {
    return null;
  }

  return {
    ...currentStore,
    contributions: normalizeContributionCollection(backup.snapshot.contributions),
    settings: sanitizeSettings(backup.snapshot.settings),
    activityLog: sanitizeActivityLog(backup.snapshot.activityLog),
  };
}

export function exportContributionsJson(contributions, settings = DEFAULT_SETTINGS) {
  return JSON.stringify(
    {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      contributions: contributions.map(({ statusKey, ...item }) => item),
      settings: sanitizeSettings(settings),
    },
    null,
    2,
  );
}
