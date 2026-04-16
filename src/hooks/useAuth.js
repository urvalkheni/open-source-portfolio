import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_ADMIN_PIN_HASH,
  DEFAULT_SESSION_TIMEOUT_MS,
  verifyHashedSecret,
} from "../utils/security";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"];

export function useAuth({
  adminPinHash = DEFAULT_ADMIN_PIN_HASH,
  sessionTimeoutMs = DEFAULT_SESSION_TIMEOUT_MS,
} = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastLogoutReason, setLastLogoutReason] = useState("");
  const timeoutRef = useRef(null);

  const clearSessionTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const logout = useCallback(
    (reason = "manual") => {
      clearSessionTimer();
      setIsAuthenticated(false);
      setLastLogoutReason(reason);
    },
    [clearSessionTimer],
  );

  const registerActivity = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

    clearSessionTimer();
    timeoutRef.current = window.setTimeout(() => {
      logout("timeout");
    }, sessionTimeoutMs);
  }, [clearSessionTimer, isAuthenticated, logout, sessionTimeoutMs]);

  const login = useCallback(
    async (pin) => {
      const isValid = await verifyHashedSecret(pin, adminPinHash);

      if (!isValid) {
        return { ok: false, error: "Incorrect admin PIN." };
      }

      setIsAuthenticated(true);
      setLastLogoutReason("");

      return { ok: true };
    },
    [adminPinHash],
  );

  const clearLogoutReason = useCallback(() => {
    setLastLogoutReason("");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      clearSessionTimer();
      return undefined;
    }

    registerActivity();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, registerActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, registerActivity);
      });
      clearSessionTimer();
    };
  }, [clearSessionTimer, isAuthenticated, registerActivity]);

  return {
    isAuthenticated,
    login,
    logout,
    registerActivity,
    lastLogoutReason,
    clearLogoutReason,
    sessionTimeoutMs,
  };
}
