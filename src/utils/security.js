const VALID_STATUSES = ["Approved", "Under Review", "In Progress"];

const FIELD_LIMITS = {
  project: 80,
  title: 140,
  description: 600,
  impact: 420,
  learnings: 700,
  area: 80,
  link: 2048,
  date: 10,
};

const TEXT_FIELD_CONFIG = {
  project: { maxLength: FIELD_LIMITS.project },
  title: { maxLength: FIELD_LIMITS.title },
  description: { maxLength: FIELD_LIMITS.description, multiline: true },
  impact: { maxLength: FIELD_LIMITS.impact, multiline: true },
  learnings: { maxLength: FIELD_LIMITS.learnings, multiline: true },
  area: { maxLength: FIELD_LIMITS.area },
};

const ALLOWED_IMPORT_KEYS = new Set([
  "id",
  "project",
  "title",
  "description",
  "status",
  "statusKey",
  "impact",
  "learnings",
  "area",
  "link",
  "date",
  "featured",
]);

const MAX_IMPORT_ITEMS = 250;
export const MAX_IMPORT_FILE_BYTES = 512 * 1024;

export const DEFAULT_ADMIN_PIN_HASH =
  import.meta.env.VITE_ADMIN_PIN_HASH ||
  "45ec61e621fcd00725ff21d091aa6d3dbe593f51b57dbe3da028f28b204dd8f6";

export const DEFAULT_SESSION_TIMEOUT_MS = 10 * 60 * 1000;

function clampTextLength(value, maxLength) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function normalizeMultilineWhitespace(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeInlineWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

export function sanitizeText(value, options = {}) {
  const { maxLength = 500, multiline = false } = options;
  const safeValue = String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "");
  const normalizedValue = multiline
    ? normalizeMultilineWhitespace(safeValue)
    : normalizeInlineWhitespace(safeValue);

  return clampTextLength(normalizedValue, maxLength);
}

export function sanitizeContributionTextFields(input = {}) {
  return Object.entries(TEXT_FIELD_CONFIG).reduce((sanitized, [field, config]) => {
    sanitized[field] = sanitizeText(input[field], config);
    return sanitized;
  }, {});
}

export function normalizeHttpsUrl(value) {
  const candidate = String(value ?? "").trim();

  if (!candidate) {
    return "";
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

export function isValidContributionDate(value) {
  if (!value) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().startsWith(value);
}

export function sanitizeContributionInput(input = {}) {
  const textFields = sanitizeContributionTextFields(input);
  const rawStatus = sanitizeText(input.status, { maxLength: 32 });
  const status = VALID_STATUSES.includes(rawStatus)
    ? rawStatus
    : "In Progress";
  const link = normalizeHttpsUrl(input.link);
  const date = sanitizeText(input.date, { maxLength: FIELD_LIMITS.date });

  return {
    id: sanitizeText(input.id, { maxLength: 160 }),
    project: textFields.project,
    title: textFields.title,
    description: textFields.description,
    status,
    impact: textFields.impact,
    learnings: textFields.learnings,
    area: textFields.area,
    link,
    date,
    featured: Boolean(input.featured),
  };
}

export function validateContributionInput(input = {}) {
  const sanitized = sanitizeContributionInput(input);
  const errors = {};
  const rawStatus = sanitizeText(input.status, { maxLength: 32 });

  if (!sanitized.title) {
    errors.title = "A contribution title is required.";
  }

  if (!sanitized.link) {
    errors.link = "A valid https:// PR link is required.";
  }

  if (!VALID_STATUSES.includes(rawStatus)) {
    errors.status = "Select a valid contribution status.";
  }

  if (!isValidContributionDate(sanitized.date)) {
    errors.date = "Enter a valid date.";
  }

  return {
    sanitized,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

function slugifyId(value) {
  return sanitizeText(value, { maxLength: 160 })
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createContributionId(item, index) {
  const base = slugifyId(`${item.project || "contribution"}-${item.title || index + 1}`);

  return base || `contribution-${index + 1}`;
}

function ensureUniqueContributionIds(items) {
  const seenIds = new Set();

  return items.map((item, index) => {
    const baseId = slugifyId(item.id) || createContributionId(item, index);
    let nextId = baseId;
    let suffix = 2;

    while (seenIds.has(nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    seenIds.add(nextId);

    return {
      ...item,
      id: nextId,
    };
  });
}

export function sanitizeStoredContributions(items = []) {
  if (!Array.isArray(items)) {
    return { items: [], modified: true, rejectedCount: 0 };
  }

  let modified = false;
  let rejectedCount = 0;
  const safeItems = [];

  items.forEach((item) => {
    const result = validateContributionInput(item);

    if (!result.isValid) {
      rejectedCount += 1;
      modified = true;
      return;
    }

    const normalizedItem = {
      ...result.sanitized,
      id: sanitizeText(item?.id, { maxLength: 160 }),
      featured: Boolean(item?.featured),
    };

    safeItems.push(normalizedItem);

    if (JSON.stringify(normalizedItem) !== JSON.stringify(item)) {
      modified = true;
    }
  });

  const dedupedItems = ensureUniqueContributionIds(safeItems);

  if (JSON.stringify(dedupedItems) !== JSON.stringify(safeItems)) {
    modified = true;
  }

  return { items: dedupedItems, modified, rejectedCount };
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function pickAllowedFields(item) {
  const safeObject = {};

  Object.keys(item).forEach((key) => {
    if (ALLOWED_IMPORT_KEYS.has(key)) {
      safeObject[key] = item[key];
    }
  });

  return safeObject;
}

export function validateContributionImportPayload(payload) {
  if (!Array.isArray(payload)) {
    throw new Error("Imported JSON must be an array of contributions.");
  }

  if (payload.length > MAX_IMPORT_ITEMS) {
    throw new Error(`Import is limited to ${MAX_IMPORT_ITEMS} contributions.`);
  }

  const sanitizedItems = payload.map((item, index) => {
    if (!isPlainObject(item)) {
      throw new Error(`Contribution ${index + 1} is not a valid object.`);
    }

    const unknownKeys = Object.keys(item).filter((key) => !ALLOWED_IMPORT_KEYS.has(key));

    if (unknownKeys.length > 0) {
      throw new Error(
        `Contribution ${index + 1} contains unsupported fields: ${unknownKeys.join(", ")}.`,
      );
    }

    const result = validateContributionInput(pickAllowedFields(item));

    if (!result.isValid) {
      const firstError = Object.values(result.errors)[0];
      throw new Error(`Contribution ${index + 1}: ${firstError}`);
    }

    return {
      ...result.sanitized,
      id: sanitizeText(item.id, { maxLength: 160 }),
      featured: Boolean(item.featured),
    };
  });

  return ensureUniqueContributionIds(sanitizedItems);
}

export async function hashSecret(value) {
  const safeValue = String(value ?? "");
  const encoder = new TextEncoder();
  const data = encoder.encode(safeValue);
  const buffer = await window.crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyHashedSecret(value, expectedHash) {
  const normalizedHash = String(expectedHash ?? "").trim().toLowerCase();

  if (!normalizedHash) {
    return false;
  }

  const digest = await hashSecret(value);

  return digest === normalizedHash;
}

export function getValidStatuses() {
  return [...VALID_STATUSES];
}
