import { useNavigate, useLocation } from "react-router";
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
} from "lucide-react";
import { useTheme } from "../../app/providers/ThemeProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ImageWithFallback } from "./ImageWithFallback";

const allNavItems = [
  {
    to: "/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    requiredRole: "ADMIN" as const,
  },
  {
    to: "/admin?tab=scan-jobs",
    label: "Kiểm duyệt",
    icon: Shield,
    requiredRole: "ADMIN" as const,
  },
  {
    to: "/admin?tab=users",
    label: "Người dùng",
    icon: Users,
    requiredRole: "ADMIN" as const,
  },
  {
    to: "/admin/analytics",
    label: "Phân tích",
    icon: BarChart3,
    requiredRole: "ADMIN" as const,
  },
  {
    to: "/plan",
    label: "Gói & thanh toán",
    icon: CreditCard,
    requiredRole: "USER" as const,
  },
  {
    to: "/detect",
    label: "Kiểm tra nội dung",
    icon: ScanSearch,
    requiredRole: "USER" as const,
  },
  {
    to: "/realtime",
    label: "Giám sát trực tiếp",
    icon: Radio,
    requiredRole: "USER" as const,
    live: true,
  },
  {
    to: "/history",
    label: "Lịch sử kiểm tra",
    icon: History,
    requiredRole: "USER" as const,
  },
];

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role, logout } = useAuth();

  const navItems = allNavItems.filter((item) => item.requiredRole === role);
  const isNavItemActive = (to: string) => {
    const [pathname, search] = to.split("?");
    if (location.pathname !== pathname) return false;
    if (!search) return true;

    const itemParams = new URLSearchParams(search);
    const currentParams = new URLSearchParams(location.search);
    return Array.from(itemParams).every(
      ([key, value]) => currentParams.get(key) === value,
    );
  };

  const initials = profile?.fullName?.charAt(0).toUpperCase() || "U";

  return (
    <aside
      className={`${mobile ? "relative" : "fixed left-0 top-0"} z-40 flex h-dvh w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground`}
      aria-label="Điều hướng chính"
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-blue-500/30 transition-transform hover:scale-[1.03]"
          aria-label="Về trang chủ DeepGuard"
        >
          <Shield className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-left leading-none"
        >
          <span className="block text-[17px] font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
            Deep<span className="text-primary">Guard</span>
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
            Bảo vệ nội dung số
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
          {role === "ADMIN" ? "Quản trị" : "Không gian làm việc"}
        </p>
        <div className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, live }) => {
            const active = isNavItemActive(to);
            return (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition-colors duration-150 ${
                  active
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(79,127,226,0.12)] dark:bg-primary/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="min-w-0 flex-1">{label}</span>
                {live && (
                  <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-red-600 dark:text-red-400">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 border-t border-sidebar-border pt-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
            Tài khoản
          </p>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            aria-current={location.pathname === "/settings" ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition-colors duration-150 ${
              location.pathname === "/settings"
                ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(79,127,226,0.12)] dark:bg-primary/15"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
            }`}
          >
            <Settings className="h-4.5 w-4.5 shrink-0" />
            Cài đặt
          </button>
        </div>
      </nav>

      <div className="space-y-3 border-t border-sidebar-border px-3 py-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-secondary-foreground transition-colors hover:bg-accent"
          aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
        >
          <span className="flex items-center gap-3 text-[13px] font-semibold">
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-primary" />
            )}
            {theme === "dark" ? "Giao diện tối" : "Giao diện sáng"}
          </span>
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-slate-300"}`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${theme === "dark" ? "translate-x-4.5" : "translate-x-0.5"}`}
            />
          </span>
        </button>

        <div className="flex items-center gap-3 px-2">
          {profile?.avatarUrl ? (
            <ImageWithFallback
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
              {profile?.fullName || "Người dùng"}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {profile?.bio || "Tài khoản DeepGuard"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
