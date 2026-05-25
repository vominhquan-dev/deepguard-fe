import { useLocation, Outlet } from "react-router";
import { AnimatePresence } from "motion/react";
import { ThemeProvider } from "../providers/ThemeProvider";
import { AuthProvider } from "../../features/auth/context/AuthContext";
import { useAuthInit } from "../../features/auth/hooks/useAuthInit";
import { PageTransition } from "../../shared/components/PageTransition";

function RootLayoutContent() {
  const location = useLocation();
  useAuthInit(); // Initialize auth and load profile

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300"
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
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
