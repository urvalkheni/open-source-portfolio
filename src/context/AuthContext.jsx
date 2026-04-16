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
  DEFAULT_SESSION_TIMEOUT_MS,
  formatSessionCountdown,
  verifyAdminPin,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastLogoutReason, setLastLogoutReason] = useState("");
  const [sessionRemainingMs, setSessionRemainingMs] = useState(0);
  const expiryRef = useRef(null);

  const resetSession = useCallback((timeoutMs = DEFAULT_SESSION_TIMEOUT_MS) => {
    expiryRef.current = Date.now() + timeoutMs;
    setSessionRemainingMs(timeoutMs);
  }, []);

  const logout = useCallback((reason = "manual") => {
    expiryRef.current = null;
    setIsAuthenticated(false);
    setSessionRemainingMs(0);
    setLastLogoutReason(reason);
  }, []);

  const login = useCallback(async (pin) => {
    const result = await verifyAdminPin(pin);

    if (!result.ok) {
      return result;
    }

    setIsAuthenticated(true);
    setLastLogoutReason("");
    resetSession();

    return { ok: true };
  }, [resetSession]);

  const registerActivity = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

    resetSession();
  }, [isAuthenticated, resetSession]);

  const clearLogoutReason = useCallback(() => {
    setLastLogoutReason("");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const remaining = Math.max(0, (expiryRef.current ?? 0) - Date.now());

      setSessionRemainingMs(remaining);

      if (remaining <= 0) {
        logout("timeout");
      }
    }, 1000);

    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    const activityHandler = () => registerActivity();

    events.forEach((eventName) => {
      window.addEventListener(eventName, activityHandler, { passive: true });
    });

    return () => {
      window.clearInterval(intervalId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, activityHandler);
      });
    };
  }, [isAuthenticated, logout, registerActivity]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      sessionRemainingMs,
      sessionCountdownLabel: formatSessionCountdown(sessionRemainingMs),
      lastLogoutReason,
      login,
      logout,
      registerActivity,
      clearLogoutReason,
    }),
    [isAuthenticated, lastLogoutReason, sessionRemainingMs],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider.");
  }

  return context;
}
