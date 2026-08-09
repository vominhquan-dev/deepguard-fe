import { NavLink, useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ScanSearch,
  History,
  BarChart3,
  Settings,
  Shield,
  Sun,
  Moon,
  LogOut,
  Radio,
  CreditCard,
  Users,
  Receipt,
} from "lucide-react";
import { useTheme } from "../../app/providers/ThemeProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ImageWithFallback } from "./ImageWithFallback";

const navItemConfigs: Array<{
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: "ADMIN" | "USER";
}> = [
  {
    to: "/dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboard,
    requiredRole: "ADMIN",
  },
  {
    to: "/admin?tab=scan-jobs",
    labelKey: "nav.adminActions",
    icon: Shield,
    requiredRole: "ADMIN",
  },
  {
    to: "/admin?tab=users",
    labelKey: "nav.userManagement",
    icon: Users,
    requiredRole: "ADMIN",
  },
  {
    to: "/admin/analytics",
    labelKey: "nav.analytics",
    icon: BarChart3,
    requiredRole: "ADMIN",
  },
  {
    to: "/admin/billing-history",
    labelKey: "nav.billingHistory",
    icon: Receipt,
    requiredRole: "ADMIN",
  },
  {
    to: "/plan",
    labelKey: "nav.planBilling",
    icon: CreditCard,
    requiredRole: "USER",
  },
  {
    to: "/detect",
    labelKey: "nav.detectMedia",
    icon: ScanSearch,
    requiredRole: "USER",
  },
  {
    to: "/realtime",
    labelKey: "nav.realtimeMonitor",
    icon: Radio,
    requiredRole: "USER",
  },
  {
    to: "/history",
    labelKey: "nav.history",
    icon: History,
    requiredRole: "USER",
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role, logout } = useAuth();
  const workspaceHome = role === "ADMIN" ? "/dashboard" : "/detect";

  // Filter nav items based on user role
  const navItems = navItemConfigs.filter((item) => {
    if (!item.requiredRole) return true;
    const requiredRoles = Array.isArray(item.requiredRole)
      ? item.requiredRole
      : [item.requiredRole];
    return role && requiredRoles.includes(role);
  });

  // Helper to check if a nav item is active including search params
  const isNavItemActive = (to: string) => {
    const [pathname, search] = to.split("?");
    if (location.pathname !== pathname) return false;
    if (!search) return true;
    const itemParams = new URLSearchParams(search);
    const currentParams = new URLSearchParams(location.search);
    for (const [key, value] of itemParams) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <button
          type="button"
          aria-label="Về trang chủ DeepGuard"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-blue-500/30 transition-transform hover:scale-[1.03]"
          onClick={() => navigate(workspaceHome)}
        >
          <Shield className="h-4.5 w-4.5" />
        </button>
        <button type="button" onClick={() => navigate(workspaceHome)} className="text-left leading-none">
          <span className="block text-[17px] font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
            Deep<span className="text-primary">Guard</span>
          </span>
          <span
            className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500"
          >
            {t("app.tagline")}
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p
          className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500"
        >
          {t("nav.mainMenu")}
        </p>
        {navItems.map(({ to, labelKey, icon: Icon }) => {
          const active = isNavItemActive(to);
          return (
            <button
              type="button"
              key={labelKey}
              onClick={() => navigate(to)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition-colors duration-150 ${
                active
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(79,127,226,0.12)] dark:bg-primary/15"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="min-w-0 flex-1">
                {t(labelKey)}
              </span>
              {active && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
              {/* Live badge for Realtime Monitor */}
              {!active && labelKey === "nav.realtimeMonitor" && (
                <span
                  className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-red-600 dark:text-red-400"
                >
                  {t("nav.live")}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-5 border-t border-sidebar-border pt-4">
          <p
            className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500"
          >
            {t("nav.system")}
          </p>
          <NavLink
            to="/settings"
            end
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(79,127,226,0.12)] dark:bg-primary/15"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings className="h-4.5 w-4.5 shrink-0" />
                <span className="min-w-0 flex-1">
                  {t("nav.settings")}
                </span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Bottom */}
      <div className="space-y-3 border-t border-sidebar-border px-3 py-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          className="flex w-full items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-secondary-foreground transition-colors hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
            <span className="text-[13px] font-semibold">
              {theme === "dark" ? t("theme.dark") : t("theme.light")}
            </span>
          </div>
          <div
            className={`relative h-5 w-10 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-slate-300"}`}
          >
            <div
              className={`absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`}
            />
          </div>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-2">
          {profile?.avatarUrl ? (
            <ImageWithFallback
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
              <span>
                {profile?.fullName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
              {profile?.fullName || "User"}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {profile === null ? (
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-500 font-medium">
                    {t("user.noProfile")}
                  </span>
                </span>
              ) : profile?.bio ? (
                profile.bio
              ) : (
                t("user.noBio")
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            title={t("user.logout")}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
