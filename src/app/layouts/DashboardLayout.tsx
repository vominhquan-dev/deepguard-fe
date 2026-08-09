import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Toaster } from "sonner";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Coins,
  HelpCircle,
  Info,
  LogOut,
  Menu,
  ScanSearch,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { Sidebar } from "../../shared/components/Sidebar";
import { ImageWithFallback } from "../../shared/components/ImageWithFallback";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useTheme } from "../providers/ThemeProvider";
import { useCredits } from "../../features/billing/hooks/useCredits";

interface DashboardLayoutProps {
  children: ReactNode;
}

const notifications = [
  {
    id: 1,
    type: "danger",
    icon: AlertTriangle,
    title: "Phát hiện nội dung có rủi ro cao",
    desc: "interview_clip.mp4 có mức rủi ro 87%.",
    time: "2 phút trước",
    read: false,
  },
  {
    id: 2,
    type: "info",
    icon: Info,
    title: "Báo cáo tuần đã sẵn sàng",
    desc: "Bạn có thể xem tổng hợp lượt kiểm tra trong tuần.",
    time: "1 giờ trước",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    icon: AlertTriangle,
    title: "Âm thanh cần được xem lại",
    desc: "voice_message.mp3 nên được kiểm tra thủ công.",
    time: "3 giờ trước",
    read: false,
  },
  {
    id: 4,
    type: "success",
    icon: CheckCircle2,
    title: "Đã hoàn tất kiểm tra",
    desc: "headshot.png được đánh giá là đáng tin cậy.",
    time: "Hôm qua",
    read: true,
  },
];

const notificationIconStyles: Record<string, string> = {
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationList, setNotificationList] = useState(notifications);
  const { theme } = useTheme();
  const { profile, logout } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const navigate = useNavigate();
  const desktopNotificationsRef = useRef<HTMLDivElement>(null);
  const mobileNotificationsRef = useRef<HTMLDivElement>(null);
  const desktopProfileRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificationList.filter((item) => !item.read).length;
  const initials = profile?.fullName?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInNotifications = [
        desktopNotificationsRef.current,
        mobileNotificationsRef.current,
      ].some((element) => element?.contains(target));
      const isInProfile = [desktopProfileRef.current, mobileProfileRef.current].some(
        (element) => element?.contains(target),
      );

      if (!isInNotifications) setNotificationsOpen(false);
      if (!isInProfile) setProfileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () =>
    setNotificationList((items) => items.map((item) => ({ ...item, read: true })));
  const markRead = (id: number) =>
    setNotificationList((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );

  const signOut = () => {
    logout();
    navigate("/login");
  };

  const CreditBadge = () => {
    const value = creditsLoading ? "..." : credits ? credits.remainingCredits : "–";
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400"
        aria-label={creditsLoading ? "Đang tải số tín dụng" : `${value} tín dụng còn lại`}
      >
        <Coins className="h-3 w-3" aria-hidden="true" />
        {value}
      </span>
    );
  };

  const Avatar = ({ size = "h-8 w-8" }: { size?: string }) =>
    profile?.avatarUrl ? (
      <ImageWithFallback
        src={profile.avatarUrl}
        alt={profile.fullName}
        className={`${size} rounded-full object-cover`}
      />
    ) : (
      <span
        className={`${size} inline-flex items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground`}
        aria-hidden="true"
      >
        {initials}
      </span>
    );

  const NotificationPanel = () => (
    <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl shadow-slate-900/10 dark:shadow-black/25">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="text-[14px] font-bold text-slate-900 dark:text-white">
            Thông báo
          </span>
          {unreadCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Đọc tất cả
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notificationList.map(({ id, type, icon: Icon, title, desc, time, read }) => (
          <button
            key={id}
            type="button"
            onClick={() => markRead(id)}
            className={`flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/60 ${!read ? "bg-primary/[0.035]" : ""}`}
          >
            <span
              className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${notificationIconStyles[type]}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </span>
              <span className="mt-0.5 block text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                {desc}
              </span>
              <span className="mt-1 block text-[10px] text-slate-400">{time}</span>
            </span>
            {!read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="border-t border-border bg-muted/40 p-3">
        <button
          type="button"
          onClick={() => {
            setNotificationsOpen(false);
            navigate("/history");
          }}
          className="flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          Xem trong lịch sử <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  const ProfileMenu = () => (
    <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-xl shadow-slate-900/10 dark:shadow-black/25">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar size="h-9 w-9" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white">
              {profile?.fullName || "Người dùng"}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {profile?.email || "Tài khoản DeepGuard"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-bold text-secondary-foreground">
            Tài khoản
          </span>
          <CreditBadge />
        </div>
      </div>

      <div className="p-1.5">
        <button
          type="button"
          onClick={() => {
            setProfileOpen(false);
            navigate("/settings");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-600 transition-colors hover:bg-muted hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <Settings className="h-4 w-4" /> Cài đặt tài khoản
        </button>
        <button
          type="button"
          onClick={() => {
            setProfileOpen(false);
            navigate("/contact");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-600 transition-colors hover:bg-muted hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <HelpCircle className="h-4 w-4" /> Hỗ trợ
        </button>
      </div>
      <div className="border-t border-border p-1.5">
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Toaster
        theme={theme}
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1b2a40" : "#ffffff",
            border: theme === "dark" ? "1px solid #30425d" : "1px solid #dce3ee",
            color: theme === "dark" ? "#edf3fc" : "#16243a",
            borderRadius: "12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
          },
        }}
      />

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-slate-950/25"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng điều hướng"
          />
          <div className="relative z-10 shadow-xl shadow-slate-900/15">
            <Sidebar mobile />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute left-[17rem] top-4 z-20 grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-slate-600 shadow-sm dark:text-slate-300"
            aria-label="Đóng điều hướng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <main className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur-sm dark:bg-[#111b2e]/90 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-slate-600 transition-colors hover:bg-muted dark:text-slate-300 lg:hidden"
              aria-label="Mở điều hướng"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-4 w-4" />
              </span>
              <span className="text-[15px] font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                Deep<span className="text-primary">Guard</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/detect")}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-[12px] font-bold text-primary-foreground shadow-sm shadow-blue-500/25 transition-colors hover:bg-[#406dcc]"
            >
              <ScanSearch className="h-4 w-4" />
              <span className="hidden sm:inline">Kiểm tra mới</span>
              <span className="sr-only sm:hidden">Kiểm tra mới</span>
            </button>

            <div ref={mobileNotificationsRef} className="relative lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setProfileOpen(false);
                }}
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-border text-slate-600 transition-colors hover:bg-muted dark:text-slate-300"
                aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}`}
                aria-expanded={notificationsOpen}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-red-500 dark:border-[#111b2e]" />}
              </button>
              {notificationsOpen && <NotificationPanel />}
            </div>

            <div ref={desktopNotificationsRef} className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setProfileOpen(false);
                }}
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-border text-slate-600 transition-colors hover:bg-muted dark:text-slate-300"
                aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}`}
                aria-expanded={notificationsOpen}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-red-500 dark:border-[#111b2e]" />}
              </button>
              {notificationsOpen && <NotificationPanel />}
            </div>

            <div ref={mobileProfileRef} className="relative lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-full p-0.5 transition-shadow hover:ring-2 hover:ring-primary/30"
                aria-label="Mở menu tài khoản"
                aria-expanded={profileOpen}
              >
                <Avatar />
                <CreditBadge />
              </button>
              {profileOpen && <ProfileMenu />}
            </div>

            <div ref={desktopProfileRef} className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-full p-0.5 transition-shadow hover:ring-2 hover:ring-primary/30"
                aria-label="Mở menu tài khoản"
                aria-expanded={profileOpen}
              >
                <Avatar />
                <CreditBadge />
              </button>
              {profileOpen && <ProfileMenu />}
            </div>
          </div>
        </header>

        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
