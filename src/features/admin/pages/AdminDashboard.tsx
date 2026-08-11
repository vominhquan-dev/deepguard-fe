import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/context/AuthContext";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import {
  getScanJobs,
  getAdminMedia,
  getDetectionResults,
  getUsers,
  getUserStats,
  updateUserStatus,
  updateUserRole,
  ScanJob,
  AdminMediaItem,
  DetectionResultItem,
  AdminUser,
  AdminUserStats,
} from "../api/adminApi";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  File,
  RefreshCw,
  Calendar,
  Filter,
  Users,
  Shield,
  UserCheck,
  UserX,
  UserPlus,
  Mail,
  ChevronDown,
  Eye,
} from "lucide-react";

/* ────── Helpers ────── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string, language = "en"): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const statusConfig: Record<
  string,
  { icon: any; label: string; color: string; bg: string }
> = {
  QUEUED: {
    icon: Clock,
    label: "admin.ui.queued",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  PROCESSING: {
    icon: Loader2,
    label: "admin.ui.processing",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: "admin.ui.completed",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  FAILED: {
    icon: XCircle,
    label: "admin.ui.failed",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

const resultLabelConfig: Record<
  string,
  { icon: any; label: string; color: string; bg: string }
> = {
  REAL: {
    icon: CheckCircle2,
    label: "admin.ui.real",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  FAKE: {
    icon: AlertTriangle,
    label: "admin.ui.fake",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

function getFileIcon(fileType: string, className?: string) {
  const t = fileType?.toLowerCase() || "";
  if (t.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(t))
    return <ImageIcon className={className || "w-4 h-4"} />;
  if (t.includes("video") || ["mp4", "mov", "avi", "mkv"].includes(t))
    return <Video className={className || "w-4 h-4"} />;
  if (t.includes("audio") || ["mp3", "wav", "ogg", "flac"].includes(t))
    return <Mic className={className || "w-4 h-4"} />;
  return <File className={className || "w-4 h-4"} />;
}

/* ────── Status / Role helpers for Users ────── */

const userStatusConfig: Record<
  string,
  { icon: any; label: string; color: string; bg: string }
> = {
  ACTIVE: {
    icon: CheckCircle2,
    label: "admin.active",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  SUSPENDED: {
    icon: XCircle,
    label: "admin.suspended",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  DELETED: {
    icon: AlertTriangle,
    label: "admin.deleted",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
  PENDING_VERIFICATION: {
    icon: Clock,
    label: "admin.pending",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
};

function getUserStatusConfig(status: string) {
  return (
    userStatusConfig[status] || {
      icon: Clock,
      label: status,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    }
  );
}

const roleColors: Record<string, string> = {
  ADMIN:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  USER: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

function getRoleBadgeClass(role: string) {
  return (
    roleColors[role] ||
    "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
  );
}

/* ────── Pagination Component ────── */

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
      <span
        className="text-slate-400 dark:text-slate-500"
        style={{ fontSize: "12px" }}
      >
        {t("admin.ui.pageOf", { page: page + 1, total: totalPages })}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ────── Users Table ────── */

const USER_STATUS_OPTIONS = [
  "ACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
  "DELETED",
];
const USER_ROLE_OPTIONS = ["USER", "ADMIN"];

function UsersTable() {
  const { t, i18n } = useTranslation();
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        getUsers(accessToken, {
          keyword: keyword || undefined,
          status: statusFilter || undefined,
          roleName: roleFilter || undefined,
          page,
          size: 15,
        }),
        getUserStats(accessToken),
      ]);
      if (usersRes.success) {
        setUsers(usersRes.data.content);
        setTotalPages(usersRes.data.totalPages);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, keyword, statusFilter, roleFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    setKeyword(searchValue);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!accessToken) return;
    setUpdatingUserId(userId);
    try {
      await updateUserStatus(accessToken, userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
      );
    } catch {
      // handled
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!accessToken) return;
    setUpdatingUserId(userId);
    try {
      await updateUserRole(accessToken, userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch {
      // handled
    } finally {
      setUpdatingUserId(null);
    }
  };

  /* ── Stat cards ── */
  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "admin.totalUsers",
        value: stats.totalUsers,
        icon: Users,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
      {
        label: "admin.active",
        value: stats.activeUsers,
        icon: UserCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        label: "admin.suspended",
        value: stats.suspendedUsers,
        icon: UserX,
        color: "text-red-500",
        bg: "bg-red-500/10",
      },
      {
        label: "admin.pendingVerification",
        value: stats.pendingVerificationUsers,
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        label: "admin.admins",
        value: stats.totalAdmins,
        icon: Shield,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
    ];
  }, [stats, t]);

  return (
    <div>
      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p
                    className="text-slate-900 dark:text-white font-extrabold"
                    style={{ fontSize: "18px" }}
                  >
                    {card.value}
                  </p>
                  <p
                    className="text-slate-400 dark:text-slate-500"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    {t(card.label)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("admin.searchPlaceholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span style={{ fontSize: "12px", fontWeight: 600 }}>
            {t("admin.status")}
          </span>
        </div>
        {["", "ACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "DELETED"].map(
          (s) => (
            <button
              key={s}
              onClick={() => {
                setPage(0);
                setStatusFilter(s);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                statusFilter === s
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {s === ""
                ? t("admin.all")
                : t(
                    s === "ACTIVE"
                      ? "admin.active"
                      : s === "SUSPENDED"
                        ? "admin.suspended"
                        : s === "PENDING_VERIFICATION"
                          ? "admin.pending"
                          : "admin.deleted",
                  )}
            </button>
          ),
        )}

        {/* Role filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 ml-2">
          <Shield className="w-3.5 h-3.5" />
          <span style={{ fontSize: "12px", fontWeight: 600 }}>
            {t("admin.role")}
          </span>
        </div>
        {["", "USER", "ADMIN"].map((r) => (
          <button
            key={r}
            onClick={() => {
              setPage(0);
              setRoleFilter(r);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
              roleFilter === r
                ? "bg-purple-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {r || t("admin.all")}
          </button>
        ))}

        <button
          onClick={fetchData}
          className="ml-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div
          className="text-center py-16 text-slate-400"
          style={{ fontSize: "14px" }}
        >
          {t("admin.ui.noUsers")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.user")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.email")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.role")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.status")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.verified")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.created")}
                </th>
                <th className="text-right py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const sCfg = getUserStatusConfig(user.status);
                const StatusIcon = sCfg.icon;
                const isUpdating = updatingUserId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.fullName
                            ? user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="text-slate-900 dark:text-slate-200 font-semibold"
                            style={{ fontSize: "13px" }}
                          >
                            {user.fullName || user.username || "\u2014"}
                          </p>
                          <p
                            className="text-slate-400"
                            style={{ fontSize: "11px" }}
                          >
                            @{user.username || "\u2014"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span
                          className="text-slate-600 dark:text-slate-400"
                          style={{ fontSize: "13px" }}
                        >
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="relative">
                        <select
                          value={user.role}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className={`appearance-none px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60 ${getRoleBadgeClass(user.role)}`}
                        >
                          {USER_ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 text-purple-500 animate-spin absolute right-2 top-1/2 -translate-y-1/2" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="relative">
                        <select
                          value={user.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleStatusChange(user.id, e.target.value)
                          }
                          className={`appearance-none px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60 ${sCfg.bg} ${sCfg.color}`}
                        >
                          {USER_STATUS_OPTIONS.map((s) => {
                            const sc = getUserStatusConfig(s);
                            return (
                              <option key={s} value={s}>
                                {t(sc.label)}
                              </option>
                            );
                          })}
                        </select>
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 text-purple-500 animate-spin absolute right-2 top-1/2 -translate-y-1/2" />
                        ) : (
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {user.isVerified ? (
                        <div className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("admin.ui.yes")}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          {t("admin.ui.no")}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(user.createdAt, i18n.resolvedLanguage || "en")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        className="inline-flex items-center gap-1 text-purple-500 hover:text-purple-600 transition-colors text-xs font-semibold"
                        title={t("admin.ui.viewDetails")}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t("admin.ui.details")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

/* ────── Sub-tables (existing) ────── */

function ScanJobsTable() {
  const { t, i18n } = useTranslation();
  const { accessToken } = useAuth();
  const [data, setData] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await getScanJobs(
        accessToken,
        page,
        10,
        statusFilter || undefined,
      );
      if (res.success) {
        setData(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span style={{ fontSize: "12px", fontWeight: 600 }}>
            {t("admin.status")}
          </span>
        </div>
        {["", "QUEUED", "PROCESSING", "COMPLETED", "FAILED"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setPage(0);
              setStatusFilter(s);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
              statusFilter === s
                ? "bg-purple-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {s ? t(`admin.ui.${s.toLowerCase()}`) : t("admin.ui.all")}
          </button>
        ))}
        <button
          onClick={fetchData}
          className="ml-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div
          className="text-center py-16 text-slate-400"
          style={{ fontSize: "14px" }}
        >
          {t("admin.ui.noScanJobs")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.file")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.user")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.status")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.started")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.finished")}
                </th>
                <th className="text-right py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((job) => {
                const cfg = statusConfig[job.status] || {
                  icon: Clock,
                  label: job.status,
                  color: "text-slate-500",
                  bg: "bg-slate-500/10",
                };
                const StatusIcon = cfg.icon;
                return (
                  <tr
                    key={job.scanJobId}
                    className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(job.fileName?.split(".").pop() || "")}
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <p
                            className="text-slate-900 dark:text-slate-200 truncate font-semibold"
                            style={{ fontSize: "13px" }}
                          >
                            {job.fileName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-600 dark:text-slate-400"
                        style={{ fontSize: "13px" }}
                      >
                        {job.email}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg}`}
                      >
                        {job.status === "PROCESSING" ? (
                          <Loader2
                            className={`w-3 h-3 ${cfg.color} animate-spin`}
                          />
                        ) : (
                          <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
                        )}
                        <span
                          className={cfg.color}
                          style={{ fontSize: "11px", fontWeight: 700 }}
                        >
                          {t(cfg.label)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(job.startedAt, i18n.resolvedLanguage || "en")}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(job.finishedAt, i18n.resolvedLanguage || "en")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="inline-flex items-center gap-1 text-purple-500 hover:text-purple-600 transition-colors text-xs font-semibold">
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function MediaTable() {
  const { t, i18n } = useTranslation();
  const { accessToken } = useAuth();
  const [data, setData] = useState<AdminMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    getAdminMedia(accessToken, { page, size: 15 })
      .then((res) => {
        if (res.success) {
          setData(res.data.content);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken, page]);

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div
          className="text-center py-16 text-slate-400"
          style={{ fontSize: "14px" }}
        >
          {t("admin.ui.noMedia")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.file")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.type")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.size")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.user")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.uploaded")}
                </th>
                <th className="text-right py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        {getFileIcon(item.fileType)}
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <p
                          className="text-slate-900 dark:text-slate-200 truncate font-semibold"
                          style={{ fontSize: "13px" }}
                        >
                          {item.fileName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-500 text-xs font-medium uppercase">
                      {item.fileType || t("admin.ui.unknown")}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="text-slate-500"
                      style={{ fontSize: "12px" }}
                    >
                      {formatBytes(item.fileSize)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="text-slate-600 dark:text-slate-400"
                      style={{ fontSize: "13px" }}
                    >
                      {item.email}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(item.uploadedAt, i18n.resolvedLanguage || "en")}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-500 hover:text-purple-600 transition-colors text-xs font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t("admin.ui.open")}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function DetectionResultsTable() {
  const { t, i18n } = useTranslation();
  const { accessToken } = useAuth();
  const [data, setData] = useState<DetectionResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [labelFilter, setLabelFilter] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await getDetectionResults(
        accessToken,
        page,
        10,
        labelFilter || undefined,
      );
      if (res.success) {
        setData(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, labelFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span style={{ fontSize: "12px", fontWeight: 600 }}>
            {t("admin.label")}
          </span>
        </div>
        {["", "REAL", "FAKE"].map((l) => (
          <button
            key={l}
            onClick={() => {
              setPage(0);
              setLabelFilter(l);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
              labelFilter === l
                ? "bg-purple-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {l ? t(`admin.ui.${l.toLowerCase()}`) : t("admin.ui.all")}
          </button>
        ))}
        <button
          onClick={fetchData}
          className="ml-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div
          className="text-center py-16 text-slate-400"
          style={{ fontSize: "14px" }}
        >
          {t("admin.ui.noDetectionResults")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.preview")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.file")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.user")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.fakeProbability")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.confidence")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.result")}
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {t("admin.ui.processed")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const prediction = item.resultLabel ?? "UNKNOWN";
                const fakeProbability = item.fakeScore ?? 0;
                const realProbability = item.confidence ?? 0;
                const cfg = resultLabelConfig[prediction] || {
                  icon: AlertTriangle,
                  label: prediction,
                  color: "text-slate-500",
                  bg: "bg-slate-500/10",
                };
                const ResultIcon = cfg.icon;
                const scoreColor = "text-red-500";
                const scoreBar = "bg-red-500";
                const confidenceColor = "text-emerald-500";
                const confidenceBar = "bg-emerald-500";

                return (
                  <tr
                    key={item.detectionResultId}
                    className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <a
                          href={item.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 group relative"
                        >
                          <img
                            src={item.originalUrl}
                            alt={item.fileName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                          <div className="hidden absolute inset-0 items-center justify-center text-slate-400">
                            {getFileIcon(
                              item.fileName?.split(".").pop() || "",
                              "w-5 h-5",
                            )}
                          </div>
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(item.fileName?.split(".").pop() || "")}
                        </div>
                        <div className="min-w-0 max-w-[160px]">
                          <p
                            className="text-slate-900 dark:text-slate-200 truncate font-semibold"
                            style={{ fontSize: "13px" }}
                          >
                            {item.fileName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-600 dark:text-slate-400"
                        style={{ fontSize: "13px" }}
                      >
                        {item.email}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-extrabold ${scoreColor}`}
                          style={{ fontSize: "14px" }}
                        >
                          {Math.round(fakeProbability * 100)}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreBar}`}
                            style={{
                              width: `${Math.round(fakeProbability * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-extrabold ${confidenceColor}`}
                          style={{ fontSize: "14px" }}
                        >
                          {Math.round(realProbability * 100)}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${confidenceBar}`}
                            style={{
                              width: `${Math.round(realProbability * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg}`}
                      >
                        <ResultIcon className={`w-3 h-3 ${cfg.color}`} />
                        <span
                          className={cfg.color}
                          style={{ fontSize: "11px", fontWeight: 700 }}
                        >
                          {cfg.label.startsWith("admin.") ? t(cfg.label) : cfg.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(item.processedAt, i18n.resolvedLanguage || "en")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

/* ────── Tabs ────── */

const TABS = [
  { key: "users", label: "admin.users", icon: Users },
  { key: "scan-jobs", label: "admin.scanJobs", icon: FileText },
  { key: "media", label: "admin.media", icon: ImageIcon },
  {
    key: "detection-results",
    label: "admin.detectionResults",
    icon: AlertTriangle,
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ────── Page ────── */

export function AdminDashboard() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabKey =
    TABS.find((t) => t.key === tabParam)?.key ?? "users";

  const setActiveTab = (tab: TabKey) => {
    setSearchParams({ tab }, { replace: true });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersTable />;
      case "scan-jobs":
        return <ScanJobsTable />;
      case "media":
        return <MediaTable />;
      case "detection-results":
        return <DetectionResultsTable />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-purple-500" />
            <h1
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              {t("admin.title")}
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            {t("admin.subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
          {TABS.map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold ${
                activeTab === key
                  ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {t(label)}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
