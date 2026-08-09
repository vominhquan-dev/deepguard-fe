import { useLocation, Outlet } from "react-router";
import { AnimatePresence } from "motion/react";
import { ThemeProvider } from "../providers/ThemeProvider";
import { AuthProvider } from "../../features/auth/context/AuthContext";
import { useAuthInit } from "../../features/auth/hooks/useAuthInit";
import { PageTransition } from "../../shared/components/PageTransition";
import { I18nProvider } from "../../shared/i18n/I18nProvider";

function RootLayoutContent() {
  const location = useLocation();
  useAuthInit(); // Initialize auth and load profile

  return (
    <div
      className="min-h-screen bg-background text-foreground transition-colors duration-200"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </div>
  );
}

export function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
