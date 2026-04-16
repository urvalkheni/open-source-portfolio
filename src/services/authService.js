import {
  formatCountdown,
  verifyHashedSecret,
} from "./securityService";

export const DEFAULT_ADMIN_PIN_HASH =
  import.meta.env.VITE_ADMIN_PIN_HASH ||
  "45ec61e621fcd00725ff21d091aa6d3dbe593f51b57dbe3da028f28b204dd8f6";

export const DEFAULT_SESSION_TIMEOUT_MS = 10 * 60 * 1000;

export async function verifyAdminPin(
  pin,
  adminPinHash = DEFAULT_ADMIN_PIN_HASH,
) {
  const isValid = await verifyHashedSecret(pin, adminPinHash);

  return {
    ok: isValid,
    error: isValid ? "" : "Incorrect admin PIN.",
  };
}

export function formatSessionCountdown(milliseconds) {
  return formatCountdown(milliseconds);
}
