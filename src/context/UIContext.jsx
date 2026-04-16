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
  detectDevToolsHeuristic,
  isEditableTarget,
} from "../services/securityService";
import { useDataContext } from "./DataContext";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const { settings } = useDataContext();
  const [toasts, setToasts] = useState([]);
  const [isContentObscured, setIsContentObscured] = useState(false);
  const toastTimeoutsRef = useRef([]);
  const deterrenceNoticeRef = useRef(0);
  const blurTimeoutRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, tone = "success") => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((currentToasts) => [...currentToasts, { id, message, tone }]);

    const timeoutId = window.setTimeout(() => {
      dismissToast(id);
    }, 3200);

    toastTimeoutsRef.current.push(timeoutId);
  }, [dismissToast]);

  function pulseObscure() {
    setIsContentObscured(true);

    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }

    blurTimeoutRef.current = window.setTimeout(() => {
      setIsContentObscured(false);
    }, 1200);
  }

  useEffect(
    () => () => {
      toastTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));

      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (settings.allowContentCopying) {
      return undefined;
    }

    const handleContextMenu = (event) => {
      if (!isEditableTarget(event.target)) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event) => {
      const isProtectedCombo =
        (event.ctrlKey || event.metaKey) &&
        ["c", "u"].includes(event.key.toLowerCase());

      if (!isProtectedCombo || isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();

      if (Date.now() - deterrenceNoticeRef.current > 2500) {
        deterrenceNoticeRef.current = Date.now();
        addToast("Copy controls are disabled for this dashboard session.", "error");
      }
    };

    const intervalId = window.setInterval(() => {
      if (detectDevToolsHeuristic()) {
        pulseObscure();
      }
    }, 1800);

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.clearInterval(intervalId);
      setIsContentObscured(false);
    };
  }, [settings.allowContentCopying]);

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      dismissToast,
      isCopyProtectionActive: !settings.allowContentCopying,
      isContentObscured,
    }),
    [isContentObscured, settings.allowContentCopying, toasts],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUIContext() {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("useUIContext must be used within a UIProvider.");
  }

  return context;
}
