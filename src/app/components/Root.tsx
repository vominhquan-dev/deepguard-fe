import { useLocation, Outlet } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { PageTransition } from './PageTransition';

export function Root() {
  const location = useLocation();

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
