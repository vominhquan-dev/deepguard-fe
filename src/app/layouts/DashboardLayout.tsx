import { ReactNode, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../../shared/components/Sidebar";
import { ImageWithFallback } from "../../shared/components/ImageWithFallback";
import { useAuth } from "../../features/auth/context/AuthContext";
import {
  Shield,
  Menu,
  X,
  Bell,
  ScanSearch,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
  Coins,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { useCredits } from "../../features/billing/hooks/useCredits";
import { Toaster } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const notifications = [
  {
    id: 1,
    type: "danger",
    icon: AlertTriangle,
    title: "High-risk deepfake detected",
    desc: "interview_clip.mp4 scored 87% risk",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    type: "info",
    icon: Info,
    title: "Weekly report ready",
    desc: "Your scan summary for this week is available",
    time: "1h ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    icon: AlertTriangle,
    title: "Suspicious audio flagged",
    desc: "voice_message.mp3 needs manual review",
    time: "3h ago",
    read: false,
  },
  {
    id: 4,
    type: "success",
    icon: CheckCircle2,
    title: "Scan complete",
    desc: "headshot.png analyzed — Authentic (8%)",
    time: "Yesterday",
    read: true,
  },
];

const notifColors: Record<string, string> = {
  danger: "text-red-500",
  warning: "text-amber-500",
  info: "text-[#2563EB] dark:text-[#22D3EE]",
  success: "text-emerald-500",
};

const notifBg: Record<string, string> = {
  danger: "bg-red-500/10",
  warning: "bg-amber-500/10",
  info: "bg-blue-500/10",
  success: "bg-emerald-500/10",
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifList, setNotifList] = useState(notifications);
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifList.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }

      // Only close profile dropdown if click is outside BOTH profile refs
      // (desktop and mobile — only one is visible at a time)
      const isOutsideDesktop =
        profileRef.current && !profileRef.current.contains(e.target as Node);
      const isOutsideMobile =
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(e.target as Node);

      if (isOutsideDesktop && isOutsideMobile) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () =>
    setNotifList((ns) => ns.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) =>
    setNotifList((ns) =>
      ns.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  // ----- Shared credit badge snippet -----
  const CreditBadge = () => {
    if (creditsLoading) {
      return (
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 w-fit">
          <div className="w-2 h-2 rounded-full border border-slate-400 border-t-transparent animate-spin" />
          <span
            className="text-slate-400 dark:text-slate-500"
            style={{ fontSize: "10px", fontWeight: 700 }}
          >
            ...
          </span>
        </div>
      );
    }
    if (credits) {
      return (
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 w-fit">
          <Coins className="w-2.5 h-2.5 text-emerald-500" />
          <span
            className="text-emerald-500"
            style={{ fontSize: "10px", fontWeight: 700 }}
          >
            {credits.remainingCredits}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 w-fit">
        <span
          className="text-slate-400 dark:text-slate-500"
          style={{ fontSize: "10px", fontWeight: 700 }}
        >
          ---
        </span>
      </div>
    );
  };

  // ----- Avatar button (shared by mobile & desktop) -----
  const AvatarButton = () => {
    return profile?.avatarUrl ? (
      <ImageWithFallback
        src={profile.avatarUrl}
        alt={profile.fullName}
        className="w-8 h-8 object-cover"
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center">
        <span
          className="text-white"
          style={{ fontSize: "11px", fontWeight: 700 }}
        >
          {profile?.fullName?.charAt(0).toUpperCase() || "A"}
        </span>
      </div>
    );
  };

  // ----- Profile Dropdown (shared) -----
  const ProfileDropdown = () => (
    <div className="absolute right-0 top-10 w-56 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20 z-50">
      {/* User info */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {profile?.avatarUrl ? (
            <ImageWithFallback
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center flex-shrink-0">
              <span
                className="text-white"
                style={{ fontSize: "13px", fontWeight: 800 }}
              >
                {profile?.fullName?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p
              className="text-slate-900 dark:text-white truncate"
              style={{ fontSize: "13px", fontWeight: 700 }}
            >
              {profile?.fullName || "User"}
            </p>
            <p className="text-slate-400 truncate" style={{ fontSize: "11px" }}>
              {profile?.bio || "Loading..."}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="px-1 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 w-fit">
            <span
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "10px", fontWeight: 700 }}
            >
              Basic
            </span>
          </div>
          <CreditBadge />
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        {[
          {
            icon: User,
            label: "Profile",
            action: () => {
              navigate("/settings");
              setProfileOpen(false);
            },
          },
          {
            icon: Settings,
            label: "Settings",
            action: () => {
              navigate("/settings");
              setProfileOpen(false);
            },
          },
          {
            icon: HelpCircle,
            label: "Help & Support",
            action: () => {
              navigate("/contact");
              setProfileOpen(false);
            },
          },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Divider + Logout */}
      <div className="border-t border-slate-200 dark:border-slate-700 py-1.5">
        <button
          onClick={() => {
            navigate("/");
            setProfileOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          style={{ fontSize: "13px", fontWeight: 600 }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0F172A]">
      <Toaster
        theme={theme}
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1E293B" : "#fff",
            border:
              theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            color: theme === "dark" ? "#e2e8f0" : "#0f172a",
            borderRadius: "12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
          },
        }}
      />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center z-20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="text-slate-900 dark:text-white"
              style={{ fontWeight: 700, fontSize: "15px" }}
            >
              Deep<span className="text-[#22D3EE]">Guard</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/detect")}
              className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white"
            >
              <ScanSearch className="w-4 h-4" />
            </button>
            <button className="relative w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* Mobile User Avatar + Credit Badge */}
            <div ref={mobileProfileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-full hover:ring-2 hover:ring-[#2563EB]/40 transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                  <AvatarButton />
                </div>
                <CreditBadge />
              </button>

              {profileOpen && <ProfileDropdown />}
            </div>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-8 h-14 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60">
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/detect")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] dark:text-[#22D3EE] transition-colors"
              style={{ fontSize: "12px", fontWeight: 700 }}
            >
              <ScanSearch className="w-3.5 h-3.5" />
              New Scan
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="relative w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-[#0F172A]" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20 overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <span
                        className="text-slate-900 dark:text-white"
                        style={{ fontSize: "13px", fontWeight: 700 }}
                      >
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span
                          className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white"
                          style={{ fontSize: "10px", fontWeight: 800 }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-72 overflow-y-auto">
                    {notifList.map(
                      ({ id, type, icon: Icon, title, desc, time, read }) => (
                        <button
                          key={id}
                          onClick={() => markRead(id)}
                          className={`w-full flex gap-3 px-4 py-3 text-left border-b border-slate-100 dark:border-slate-700/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${notifBg[type]}`}
                          >
                            <Icon className={`w-4 h-4 ${notifColors[type]}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-slate-900 dark:text-slate-200"
                              style={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              {title}
                            </p>
                            <p
                              className="text-slate-500 dark:text-slate-400 mt-0.5"
                              style={{ fontSize: "11px", lineHeight: 1.4 }}
                            >
                              {desc}
                            </p>
                            <p
                              className="text-slate-400 mt-1"
                              style={{ fontSize: "10px" }}
                            >
                              {time}
                            </p>
                          </div>
                          {!read && (
                            <div className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0 mt-2" />
                          )}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate("/history");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      View all in History
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop User Avatar + Credit Badge */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-full hover:ring-2 hover:ring-[#2563EB]/40 transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                  <AvatarButton />
                </div>
                <CreditBadge />
              </button>

              {profileOpen && <ProfileDropdown />}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
