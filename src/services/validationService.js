import {
  normalizeHttpsUrl,
  sanitizePlainText,
} from "./securityService";

export const STORAGE_SCHEMA_VERSION = 2;
export const MAX_ACTIVITY_ITEMS = 12;
export const MAX_BACKUPS = 5;
export const MAX_UNDO_ITEMS = 20;
export const MAX_IMPORT_ITEMS = 250;
export const MAX_IMPORT_FILE_BYTES = 512 * 1024;

export const STATUS_LABELS = ["Approved", "Under Review", "In Progress"];
export const STATUS_OPTIONS = STATUS_LABELS.map((label) => ({
  label,
  value:
    label === "Approved"
      ? "approved"
      : label === "Under Review"
        ? "under-review"
        : "in-progress",
}));

export const CONTRIBUTION_FILTERS = [
  { label: "All", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Review", value: "under-review" },
  { label: "Progress", value: "in-progress" },
];

export const DEFAULT_SETTINGS = {
  allowContentCopying: true,
};

const CONTRIBUTION_FIELD_RULES = {
  project: { maxLength: 80 },
  title: { maxLength: 140 },
  description: { maxLength: 600, multiline: true },
  impact: { maxLength: 420, multiline: true },
  learnings: { maxLength: 700, multiline: true },
  area: { maxLength: 80 },
  date: { maxLength: 10 },
};

const ALLOWED_IMPORT_KEYS = new Set([
  "id",
  "project",
  "title",
  "description",
  "status",
  "impact",
  "learnings",
  "area",
  "link",
  "date",
  "featured",
  "createdAt",
  "updatedAt",
]);

export function getStatusKey(status = "In Progress") {
  if (status === "Approved") {
    return "approved";
  }

  if (status === "Under Review") {
    return "under-review";
  }

  return "in-progress";
}

function sanitizeContributionFields(input = {}) {
  return Object.entries(CONTRIBUTION_FIELD_RULES).reduce((sanitized, [field, rule]) => {
    sanitized[field] = sanitizePlainText(input[field], rule);
    return sanitized;
  }, {});
}

function isValidContributionDate(value) {
  if (!value) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().startsWith(value);
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function sanitizeId(value) {
  return sanitizePlainText(value, { maxLength: 160 })
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createContributionId(input, index = 0) {
  const base = sanitizeId(`${input.project || "contribution"}-${input.title || index + 1}`);

  return base || `contribution-${index + 1}`;
}

function ensureUniqueIds(items) {
  const seen = new Set();

  return items.map((item, index) => {
    const baseId = sanitizeId(item.id) || createContributionId(item, index);
    let nextId = baseId;
    let suffix = 2;

    while (seen.has(nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    seen.add(nextId);

    return {
      ...item,
      id: nextId,
    };
  });
}

export function validateContributionInput(input = {}) {
  const sanitizedFields = sanitizeContributionFields(input);
  const sanitizedStatus = sanitizePlainText(input.status, { maxLength: 32 });
  const sanitizedLink = normalizeHttpsUrl(input.link);
  const errors = {};

  if (!sanitizedFields.title) {
    errors.title = "A contribution title is required.";
  }

  if (!STATUS_LABELS.includes(sanitizedStatus)) {
    errors.status = "Select a valid status.";
  }

  if (!sanitizedLink) {
    errors.link = "A valid https:// PR link is required.";
  }

  if (!isValidContributionDate(sanitizedFields.date)) {
    errors.date = "Enter a valid date.";
  }

  return {
    sanitized: {
      id: sanitizeId(input.id),
      project: sanitizedFields.project,
      title: sanitizedFields.title,
      description: sanitizedFields.description,
      status: STATUS_LABELS.includes(sanitizedStatus)
        ? sanitizedStatus
        : "In Progress",
      impact: sanitizedFields.impact,
      learnings: sanitizedFields.learnings,
      area: sanitizedFields.area,
      link: sanitizedLink,
      date: sanitizedFields.date,
      featured: Boolean(input.featured),
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    },
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function createContributionRecord(input = {}, existingRecord, index = 0) {
  const validation = validateContributionInput({
    ...existingRecord,
    ...input,
  });
  const { sanitized, errors, isValid } = validation;

  if (!isValid) {
    throw new Error(Object.values(errors)[0] || "Invalid contribution data.");
  }

  const now = new Date().toISOString();
  const createdAt = existingRecord?.createdAt || sanitized.createdAt || now;
  const updatedAt = now;

  return {
    ...sanitized,
    id: sanitizeId(existingRecord?.id || sanitized.id) || createContributionId(sanitized, index),
    createdAt,
    updatedAt,
    statusKey: getStatusKey(sanitized.status),
  };
}

export function normalizeContributionCollection(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalizedItems = items.reduce((accumulator, item, index) => {
    const { sanitized, isValid } = validateContributionInput(item);

    if (!isValid) {
      return accumulator;
    }

    accumulator.push({
      ...sanitized,
      id: sanitizeId(item?.id) || createContributionId(sanitized, index),
      createdAt: item?.createdAt || item?.updatedAt || new Date().toISOString(),
      updatedAt: item?.updatedAt || item?.createdAt || new Date().toISOString(),
      statusKey: getStatusKey(sanitized.status),
    });

    return accumulator;
  }, []);

  return ensureUniqueIds(normalizedItems);
}

export function validateImportPayload(payload) {
  const importedSettings = isPlainObject(payload)
    ? sanitizeSettings(payload.settings)
    : undefined;
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.contributions)
      ? payload.contributions
      : null;

  if (!items) {
    throw new Error(
      "Imported JSON must be an array of contributions or a dashboard export object.",
    );
  }

  if (items.length > MAX_IMPORT_ITEMS) {
    throw new Error(`Import is limited to ${MAX_IMPORT_ITEMS} contributions.`);
  }

  const sanitizedItems = items.map((item, index) => {
    if (!isPlainObject(item)) {
      throw new Error(`Contribution ${index + 1} is not a valid object.`);
    }

    const unsupportedKeys = Object.keys(item).filter((key) => !ALLOWED_IMPORT_KEYS.has(key));

    if (unsupportedKeys.length > 0) {
      throw new Error(
        `Contribution ${index + 1} contains unsupported fields: ${unsupportedKeys.join(", ")}.`,
      );
    }

    const validation = validateContributionInput(item);

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(`Contribution ${index + 1}: ${firstError}`);
    }

    return item;
  });

  return {
    contributions: ensureUniqueIds(
      sanitizedItems.map((item, index) =>
        createContributionRecord(item, undefined, index),
      ),
    ),
    settings: importedSettings,
  };
}

export function sanitizeSettings(input = {}) {
  return {
    allowContentCopying: Boolean(
      input.allowContentCopying ?? DEFAULT_SETTINGS.allowContentCopying,
    ),
  };
}

export function computeDashboardMetrics(contributions = []) {
  const safeItems = normalizeContributionCollection(contributions);
  const topProjects = [...new Set(safeItems.map((item) => item.project).filter(Boolean))]
    .slice(0, 3)
    .join(" • ");
  const topAreas = [...new Set(safeItems.map((item) => item.area).filter(Boolean))]
    .slice(0, 3)
    .join(" • ");

  return [
    { label: "Total Contributions", value: `${safeItems.length}` },
    { label: "Projects", value: topProjects || "Suricata • Zeek • Linux" },
    { label: "Areas", value: topAreas || "Network • Kernel • Security" },
  ];
}

export function getFeaturedContributions(contributions = []) {
  const safeItems = normalizeContributionCollection(contributions);
  const featuredItems = safeItems.filter((item) => item.featured);

  return (featuredItems.length > 0 ? featuredItems : safeItems).slice(0, 3);
}

export function computeInsights(contributions = [], activityLog = []) {
  const safeItems = normalizeContributionCollection(contributions);
  const statusCounts = safeItems.reduce(
    (counts, item) => {
      counts[item.statusKey] += 1;
      return counts;
    },
    {
      approved: 0,
      "under-review": 0,
      "in-progress": 0,
    },
  );
  const domainCounts = safeItems.reduce((counts, item) => {
    if (!item.area) {
      return counts;
    }

    counts[item.area] = (counts[item.area] ?? 0) + 1;
    return counts;
  }, {});
  const mostActiveDomain = Object.entries(domainCounts).sort(
    (left, right) => right[1] - left[1],
  )[0];

  return {
    totalContributions: safeItems.length,
    approvedCount: statusCounts.approved,
    reviewCount: statusCounts["under-review"],
    progressCount: statusCounts["in-progress"],
    mostActiveDomain: mostActiveDomain
      ? `${mostActiveDomain[0]} (${mostActiveDomain[1]})`
      : "No domain data yet",
    recentActivity: activityLog.slice(0, 5),
  };
}
