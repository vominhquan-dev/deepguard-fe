import { NavLink, useNavigate } from "react-router";
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
} from "lucide-react";
import { useTheme } from "../../app/providers/ThemeProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ImageWithFallback } from "./ImageWithFallback";

const allNavItems = [
  // ADMIN navigation
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    requiredRole: "ADMIN" as const,
  },
  {
    to: "/admin",
    label: "Admin Panel",
    icon: Shield,
    requiredRole: "ADMIN" as const,
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    requiredRole: "ADMIN" as const,
  },
  // Shared navigation (USER only)
  {
    to: "/plan",
    label: "Plan & Billing",
    icon: CreditCard,
    requiredRole: "USER" as const,
  },
  // USER navigation
  {
    to: "/detect",
    label: "Detect Media",
    icon: ScanSearch,
    requiredRole: "USER" as const,
  },
  {
    to: "/realtime",
    label: "Realtime Monitor",
    icon: Radio,
    requiredRole: "USER" as const,
  },
  {
    to: "/history",
    label: "History",
    icon: History,
    requiredRole: "USER" as const,
  },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { profile, role, logout } = useAuth();

  // Filter nav items based on user role
  const navItems = allNavItems.filter((item) => {
    if (!item.requiredRole) return true; // Show to all users
    const requiredRoles = Array.isArray(item.requiredRole)
      ? item.requiredRole
      : [item.requiredRole];
    return role && requiredRoles.includes(role); // Show if user's role matches
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <div
          className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <span
            className="text-slate-900 dark:text-white cursor-pointer"
            style={{
              fontWeight: 700,
              fontSize: "15px",
              letterSpacing: "-0.3px",
            }}
            onClick={() => navigate("/")}
          >
            Deep<span className="text-[#22D3EE]">Guard</span>
          </span>
          <span
            className="block text-slate-400 dark:text-slate-500"
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            AI Platform
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p
          className="px-3 mb-3 text-slate-400 dark:text-slate-600"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Main Menu
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE] dark:bg-[#2563EB]/10"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#2563EB] dark:text-[#22D3EE]" : ""}`}
                />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  {label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                )}
                {/* Live badge for Realtime Monitor */}
                {!isActive && label === "Realtime Monitor" && (
                  <span
                    className="ml-auto px-1 py-0.5 rounded"
                    style={{
                      fontSize: "8px",
                      fontWeight: 800,
                      backgroundColor: "rgba(239,68,68,0.15)",
                      color: "#EF4444",
                      letterSpacing: "0.06em",
                    }}
                  >
                    LIVE
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 space-y-1">
          <p
            className="px-3 mb-3 text-slate-400 dark:text-slate-600"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            System
          </p>
          <NavLink
            to="/settings"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE]"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  Settings
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                )}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150"
        >
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-[#22D3EE]" />
            ) : (
              <Sun className="w-4 h-4 text-[#2563EB]" />
            )}
            <span
              className="text-slate-600 dark:text-slate-300"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          </div>
          <div
            className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${theme === "dark" ? "bg-[#2563EB]" : "bg-slate-300"}`}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${theme === "dark" ? "left-4" : "left-0.5"}`}
            />
          </div>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2">
          {profile?.avatarUrl ? (
            <ImageWithFallback
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center flex-shrink-0">
              <span
                className="text-white"
                style={{ fontSize: "11px", fontWeight: 700 }}
              >
                {profile?.fullName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-slate-900 dark:text-slate-200 truncate"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              {profile?.fullName || "User"}
            </p>
            <p className="text-slate-400 truncate" style={{ fontSize: "11px" }}>
              {profile?.bio || "Loading..."}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            title="Logout"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
