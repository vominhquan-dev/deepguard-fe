import { createBrowserRouter } from "react-router";
import { RootLayout } from "../layouts/RootLayout";
import { withAuth } from "../components/withAuth";
import { Landing } from "../../features/marketing/pages/Landing";
import { DashboardHome } from "../../features/dashboard/pages/DashboardHome";
import { Dashboard } from "../../features/dashboard/pages/Dashboard";
import { AdminDashboard } from "../../features/admin/pages/AdminDashboard";
import { AnalyticsPage } from "../../features/admin/pages/AnalyticsPage";
import { Results } from "../../features/detection/pages/Results";
import { History } from "../../features/history/pages/History";
import { Settings } from "../../features/settings/pages/Settings";
import { NotFound } from "../../features/marketing/pages/NotFound";
import { About } from "../../features/marketing/pages/About";
import { Privacy } from "../../features/marketing/pages/Privacy";
import { Contact } from "../../features/marketing/pages/Contact";
import { Login } from "../../features/auth/pages/Login";
import { Register } from "../../features/auth/pages/Register";
import { VerifyEmail } from "../../features/auth/pages/VerifyEmail";
import { ForgotPassword } from "../../features/auth/pages/ForgotPassword";
import { CreateProfile } from "../../features/auth/pages/CreateProfile";
import { Pricing } from "../../features/marketing/pages/Pricing";
import { RealtimeMonitor } from "../../features/monitoring/pages/RealtimeMonitor";
import { Plan } from "../../features/billing/pages/Plan";
import { SePayPayment } from "../../features/billing/pages/SePayPayment";

/**
 * ROLE AUTHORIZATION GUIDE:
 * - Public routes: Landing, Login, Register, Privacy, etc. (no auth required)
 * - USER routes: Detect, Realtime Monitor, History (requires USER role)
 * - ADMIN routes: Dashboard, Admin (requires ADMIN role)
 * - Authenticated routes: Settings (any logged-in user)
 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // Public routes
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "verify-email", Component: VerifyEmail },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "create-profile", Component: CreateProfile },
      { path: "about", Component: About },
      { path: "privacy", Component: Privacy },
      { path: "contact", Component: Contact },
      { path: "pricing", Component: Pricing },

      // USER routes
      { path: "detect", Component: withAuth(Dashboard, "USER") },
      { path: "results", Component: withAuth(Results, "USER") },
      { path: "history", Component: withAuth(History, "USER") },
      { path: "realtime", Component: withAuth(RealtimeMonitor, "USER") },

      // ADMIN-only routes
      { path: "dashboard", Component: withAuth(DashboardHome, "ADMIN") },
      { path: "admin", Component: withAuth(AdminDashboard, "ADMIN") },
      { path: "admin/analytics", Component: withAuth(AnalyticsPage, "ADMIN") },

      // Authenticated routes (any role)
      { path: "settings", Component: withAuth(Settings) },
      { path: "plan", Component: withAuth(Plan) },
      { path: "payment/sepay/:planId", Component: withAuth(SePayPayment) },

      { path: "*", Component: NotFound },
    ],
  },
]);
