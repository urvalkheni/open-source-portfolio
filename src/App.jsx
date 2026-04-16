import { useEffect } from "react";
import AppShell from "./components/layout/AppShell";
import Footer from "./components/layout/Footer";
import TopNav from "./components/layout/TopNav";
import ErrorBoundary from "./components/system/ErrorBoundary";
import Toast from "./components/ui/Toast";
import AppProviders from "./context/AppProviders";
import { useAuthContext } from "./context/AuthContext";
import { useDataContext } from "./context/DataContext";
import { useUIContext } from "./context/UIContext";
import Hero from "./sections/Hero";
import HighImpact from "./sections/HighImpact";
import Contributions from "./sections/Contributions";
import Skills from "./sections/Skills";
import "./styles/global.css";

function AppContent() {
  const {
    clearBootMessages,
    bootMessages,
    errorMessage,
    featuredContributions,
    isLoading,
    metrics,
  } = useDataContext();
  const {
    clearLogoutReason,
    isAuthenticated,
    lastLogoutReason,
    sessionCountdownLabel,
  } = useAuthContext();
  const {
    addToast,
    dismissToast,
    isContentObscured,
    isCopyProtectionActive,
    toasts,
  } = useUIContext();

  useEffect(() => {
    if (bootMessages.length === 0) {
      return;
    }

    bootMessages.forEach((message) => {
      addToast(message, message.toLowerCase().includes("recovered") ? "error" : "success");
    });
    clearBootMessages();
  }, [addToast, bootMessages, clearBootMessages]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    addToast(errorMessage, "error");
  }, [addToast, errorMessage]);

  useEffect(() => {
    if (lastLogoutReason !== "timeout") {
      return;
    }

    addToast("Admin session timed out after inactivity.", "error");
    clearLogoutReason();
  }, [addToast, clearLogoutReason, lastLogoutReason]);

  return (
    <AppShell
      isCopyProtectionActive={isCopyProtectionActive}
      isContentObscured={isContentObscured}
    >
      <TopNav
        isAdminAuthenticated={isAuthenticated}
        sessionCountdownLabel={sessionCountdownLabel}
      />
      <main>
        <Hero metrics={metrics} isLoading={isLoading} />
        <HighImpact contributions={featuredContributions} />
        <Contributions />
        <Skills />
      </main>
      <Footer />
      <Toast items={toasts} onDismiss={dismissToast} />
    </AppShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
