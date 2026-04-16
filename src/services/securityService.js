const HTML_TAG_PATTERN = /<[^>]*>/g;
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

export function deepFreezeInDev(value) {
  if (!import.meta.env.DEV || value === null || typeof value !== "object") {
    return value;
  }

  Object.freeze(value);

  Object.getOwnPropertyNames(value).forEach((propertyName) => {
    const propertyValue = value[propertyName];

    if (
      propertyValue !== null &&
      (typeof propertyValue === "object" || typeof propertyValue === "function") &&
      !Object.isFrozen(propertyValue)
    ) {
      deepFreezeInDev(propertyValue);
    }
  });

  return value;
}

export function createImmutableState(value) {
  return deepFreezeInDev(deepClone(value));
}

export function stripHtmlContent(value) {
  return String(value ?? "").replace(HTML_TAG_PATTERN, " ");
}

export function escapeHtmlCharacters(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeWhitespace(value, multiline = false) {
  if (multiline) {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return value.replace(/\s+/g, " ").trim();
}

export function sanitizePlainText(value, options = {}) {
  const { maxLength = 500, multiline = false } = options;
  const strippedValue = stripHtmlContent(String(value ?? ""))
    .normalize("NFKC")
    .replace(CONTROL_CHAR_PATTERN, "")
    .replace(/[<>]/g, "");
  const normalizedValue = normalizeWhitespace(strippedValue, multiline);

  return normalizedValue.slice(0, maxLength);
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

    if (url.username || url.password) {
      return "";
    }

    if (/[<>]/.test(url.href)) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

export async function hashSecret(value) {
  const encoder = new TextEncoder();
  const input = encoder.encode(String(value ?? ""));
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", input);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyHashedSecret(value, expectedHash) {
  if (!expectedHash) {
    return false;
  }

  const computedHash = await hashSecret(value);

  return computedHash === String(expectedHash).trim().toLowerCase();
}

export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "Not available";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCountdown(milliseconds) {
  const safeMs = Math.max(0, milliseconds);
  const minutes = Math.floor(safeMs / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.closest("input, textarea, [contenteditable='true'], [data-allow-copy='true']") !== null
  );
}

export function detectDevToolsHeuristic() {
  if (typeof window === "undefined") {
    return false;
  }

  const widthGap = window.outerWidth - window.innerWidth;
  const heightGap = window.outerHeight - window.innerHeight;

  return widthGap > 160 || heightGap > 160;
}
