import { createBrowserRouter } from "react-router";
import { RootLayout } from "../layouts/RootLayout";
import { Landing } from "../../features/marketing/pages/Landing";
import { DashboardHome } from "../../features/dashboard/pages/DashboardHome";
import { Dashboard } from "../../features/dashboard/pages/Dashboard";
import { Results } from "../../features/detection/pages/Results";
import { History } from "../../features/history/pages/History";
import { Analytics } from "../../features/analytics/pages/Analytics";
import { Settings } from "../../features/settings/pages/Settings";
import { NotFound } from "../../features/marketing/pages/NotFound";
import { About } from "../../features/marketing/pages/About";
import { Privacy } from "../../features/marketing/pages/Privacy";
import { Contact } from "../../features/marketing/pages/Contact";
import { Login } from "../../features/auth/pages/Login";
import { Register } from "../../features/auth/pages/Register";
import { ForgotPassword } from "../../features/auth/pages/ForgotPassword";
import { Pricing } from "../../features/marketing/pages/Pricing";
import { RealtimeMonitor } from "../../features/monitoring/pages/RealtimeMonitor";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Landing },
      { path: "dashboard", Component: DashboardHome },
      { path: "detect", Component: Dashboard },
      { path: "results", Component: Results },
      { path: "history", Component: History },
      { path: "analytics", Component: Analytics },
      { path: "realtime", Component: RealtimeMonitor },
      { path: "settings", Component: Settings },
      { path: "about", Component: About },
      { path: "privacy", Component: Privacy },
      { path: "contact", Component: Contact },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "pricing", Component: Pricing },
      { path: "*", Component: NotFound },
    ],
  },
]);
