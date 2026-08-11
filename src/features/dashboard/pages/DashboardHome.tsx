import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useAuthorizationCheck } from "../../auth/hooks/useAuthorizationCheck";
import { useAuth } from "../../auth/context/AuthContext";
import {
  ScanSearch,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Image as ImageIcon,
  Video,
  Mic,
  ArrowRight,
  ExternalLink,
  Bell,
  Cpu,
  Activity,
  Zap,
  BarChart2,
  BarChart3,
  Loader2,
  UserCheck,
  UserX,
  UserPlus,
  Mail,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getScanJobs,
  getUsers,
  getUserStats,
  getAdminAnalytics,
  ScanJob,
  AdminUserStats,
} from "../../admin/api/adminApi";
import {
  createAdminCacheKey,
  getCachedAdminData,
} from "../../admin/api/adminCache";

/* ── Helpers ── */
function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function getFileIcon(fileType: string, className?: string) {
  const t = fileType?.toLowerCase() || "";
  if (t.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(t))
    return <ImageIcon className={className || "w-4 h-4"} />;
  if (t.includes("video") || ["mp4", "mov", "avi", "mkv"].includes(t))
    return <Video className={className || "w-4 h-4"} />;
  if (t.includes("audio") || ["mp3", "wav", "ogg", "flac"].includes(t))
    return <Mic className={className || "w-4 h-4"} />;
  return <ImageIcon className={className || "w-4 h-4"} />;
}

/* ── Dummy data for non-admin user ── */
const scanTrend = [
  { day: "Mon", scans: 12 },
  { day: "Tue", scans: 19 },
  { day: "Wed", scans: 8 },
  { day: "Thu", scans: 24 },
  { day: "Fri", scans: 21 },
  { day: "Sat", scans: 15 },
  { day: "Sun", scans: 9 },
];

const recentScans = [
  {
    id: 1,
    name: "interview_clip.mp4",
    type: "Video",
    verdict: "Deepfake",
    risk: 87,
    date: "2 min ago",
  },
  {
    id: 2,
    name: "profile_photo.jpg",
    type: "Image",
    verdict: "Authentic",
    risk: 12,
    date: "1 hr ago",
  },
  {
    id: 3,
    name: "voice_msg.mp3",
    type: "Audio",
    verdict: "Suspicious",
    risk: 65,
    date: "3 hr ago",
  },
  {
    id: 4,
    name: "news_segment.mp4",
    type: "Video",
    verdict: "Deepfake",
    risk: 91,
    date: "Yesterday",
  },
  {
    id: 5,
    name: "headshot.png",
    type: "Image",
    verdict: "Authentic",
    risk: 8,
    date: "Yesterday",
  },
];

const alerts = [
  {
    msg: "High-risk deepfake detected in your last scan",
    time: "2m ago",
    color: "bg-red-500/10 border-red-500/20 text-red-500",
  },
  {
    msg: "Your weekly scan report is ready to download",
    time: "1h ago",
    color: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  },
  {
    msg: "Suspicious audio file requires manual review",
    time: "3h ago",
    color: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  },
];

const typeIcon: Record<string, any> = { Video, Image: ImageIcon, Audio: Mic };
const verdictStyle: Record<string, any> = {
  Deepfake: { bg: "bg-red-500/10", text: "text-red-500", icon: AlertTriangle },
  Suspicious: { bg: "bg-amber-500/10", text: "text-amber-500", icon: Clock },
  Authentic: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    icon: CheckCircle2,
  },
};

/* ── Chart Colors ── */
const CHART_COLORS = [
  "#8B5CF6",
  "#2563EB",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#EC4899",
];

/* ── Admin Dashboard ── */
function AdminDashboardView() {
  const navigate = useNavigate();
  const { accessToken, profile } = useAuth();

  // ── Full user stats from /api/admin/users/stats ──
  const [fullUserStats, setFullUserStats] = useState<AdminUserStats | null>(
    null,
  );

  // ── Scan jobs data ──
  const [totalScans, setTotalScans] = useState<number>(0);
  const [scanStatusCounts, setScanStatusCounts] = useState<
    Record<string, number>
  >({});
  const [recentJobs, setRecentJobs] = useState<ScanJob[]>([]);

  // ── Media data ──
  const [totalMedia, setTotalMedia] = useState<number>(0);
  const [mediaTypeCounts, setMediaTypeCounts] = useState<
    Record<string, number>
  >({});

  // ── Users table (top 5 recent) ──
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    const token: string = accessToken;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      // Helper to safely call an API – if it fails we just log and skip
      async function safeFetch<T>(
        fetcher: () => Promise<{
          success: boolean;
          data?: T;
          message?: string;
        }>,
        onSuccess: (data: T) => void,
      ) {
        try {
          const res = await fetcher();
          if (res.success && res.data) {
            onSuccess(res.data);
          } else {
            console.warn("Admin API returned success=false:", res.message);
          }
        } catch (err) {
          console.warn("Admin API call failed:", err);
        }
      }

      // Fire all API calls independently – one failure won't block the others
      await Promise.all([
        safeFetch(
          () =>
            getCachedAdminData(
              token,
              "users:stats",
              () => getUserStats(token),
            ),
          (data) => setFullUserStats(data),
        ),
        safeFetch(
          () =>
            getCachedAdminData(
              token,
              "analytics:summary",
              () => getAdminAnalytics(token),
              { ttlMs: 120_000 },
            ),
          (data) => {
            setTotalScans(data.totalScanJobs);
            setScanStatusCounts(data.scanJobStatusCounts);
            setTotalMedia(data.totalMediaFiles);
            setMediaTypeCounts(data.mediaTypeCounts);
          },
        ),
        safeFetch(
          () =>
            getCachedAdminData(
              token,
              createAdminCacheKey("scan-jobs", { page: 0, size: 5 }),
              () => getScanJobs(token, 0, 5),
            ),
          (data) => setRecentJobs(data.content),
        ),
        safeFetch(
          () =>
            getCachedAdminData(
              token,
              createAdminCacheKey("users", {
                page: 0,
                size: 5,
                sort: ["createdAt,desc"],
              }),
              () => getUsers(token, { page: 0, size: 5, sort: ["createdAt,desc"] }),
            ),
          (data) => setRecentUsers(data.content),
        ),
      ]);

      if (!cancelled) setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  // ── KPI Cards (6 user stats + scans + media) ──
  const kpiCards = [
    {
      label: "Total Users",
      value: fullUserStats ? formatNumber(fullUserStats.totalUsers) : "-",
      sub: "All registered users",
      icon: Shield,
      color: "#8B5CF6",
      bg: "bg-purple-500/10",
      trend: `${fullUserStats?.totalAdmins ?? 0} admins`,
    },
    {
      label: "Active Users",
      value: fullUserStats ? formatNumber(fullUserStats.activeUsers) : "-",
      sub: "Currently active",
      icon: UserCheck,
      color: "#10B981",
      bg: "bg-emerald-500/10",
      trend: `${fullUserStats ? ((fullUserStats.activeUsers / fullUserStats.totalUsers) * 100).toFixed(1) : 0}%`,
    },
    {
      label: "Suspended",
      value: fullUserStats ? formatNumber(fullUserStats.suspendedUsers) : "-",
      sub: "Suspended accounts",
      icon: UserX,
      color: "#EF4444",
      bg: "bg-red-500/10",
      trend: "Flagged users",
    },
    {
      label: "Pending Verification",
      value: fullUserStats
        ? formatNumber(fullUserStats.pendingVerificationUsers)
        : "-",
      sub: "Awaiting email verification",
      icon: Mail,
      color: "#F59E0B",
      bg: "bg-amber-500/10",
      trend: "Unverified",
    },
    {
      label: "Total Scans",
      value: formatNumber(totalScans),
      sub: "Across all users",
      icon: Cpu,
      color: "#2563EB",
      bg: "bg-blue-500/10",
      trend: `${Object.keys(scanStatusCounts).length} statuses`,
    },
    {
      label: "Total Deepfakes",
      value: "—",
      sub: "Via detection results",
      icon: AlertTriangle,
      color: "#EF4444",
      bg: "bg-red-500/10",
      trend: "Requires API",
    },
    {
      label: "Authentic Files",
      value: "—",
      sub: "Via detection results",
      icon: CheckCircle2,
      color: "#10B981",
      bg: "bg-emerald-500/10",
      trend: "Requires API",
    },
    {
      label: "Media Files",
      value: formatNumber(totalMedia),
      sub: "Total uploaded files",
      icon: ImageIcon,
      color: "#10B981",
      bg: "bg-emerald-500/10",
      trend: "All types",
    },
  ];

  // ── Charts data ──
  const scanStatusData = Object.entries(scanStatusCounts).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const mediaTypeData = Object.entries(mediaTypeCounts).map(
    ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }),
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
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
              Admin Dashboard
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            System overview & analytics —{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/analytics")}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
          style={{ fontSize: "14px", fontWeight: 700 }}
        >
          <BarChart3 className="w-4 h-4" />
          View Analytics
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── KPI Cards (8 cards in 4 cols) ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiCards.map(
              ({ label, value, sub, icon: Icon, color, bg, trend }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color }}>
                      {trend}
                    </span>
                  </div>
                  <p
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-slate-900 dark:text-white mt-1"
                    style={{ fontSize: "20px", fontWeight: 700 }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-slate-400 text-xs mt-1"
                    style={{ fontSize: "11px" }}
                  >
                    {sub}
                  </p>
                </motion.div>
              ),
            )}
          </div>

          {/* ── Charts Row (3 columns) ── */}
          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            {/* Scan Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
            >
              <h3
                className="text-slate-900 dark:text-white mb-4"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                Scan Status Distribution
              </h3>
              {scanStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={scanStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {scanStatusData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1E293B",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
                  No scan data available
                </div>
              )}
            </motion.div>

            {/* Media Type Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
            >
              <h3
                className="text-slate-900 dark:text-white mb-4"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                Media by Type
              </h3>
              {mediaTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mediaTypeData} barSize={40}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.1)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748B", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748B", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1E293B",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {mediaTypeData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
                  No media uploaded yet
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Admin Quick Actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 mb-6"
          >
            <h3
              className="text-slate-900 dark:text-white mb-4"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Admin Actions
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: "View Analytics",
                  action: () => navigate("/admin/analytics"),
                  icon: BarChart3,
                },
                {
                  label: "User Management",
                  action: () => navigate("/admin?tab=users"),
                  icon: Shield,
                },
                {
                  label: "Scan Jobs",
                  action: () => navigate("/admin?tab=scan-jobs"),
                  icon: Cpu,
                },
                {
                  label: "Detection Results",
                  action: () => navigate("/admin?tab=detection-results"),
                  icon: AlertTriangle,
                },
              ].map(({ label, action, icon: Icon }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Recent Users + Recent Scans side by side ── */}
          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            {/* Recent Users */}
            {recentUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-purple-500" />
                    <h2
                      className="text-slate-900 dark:text-white"
                      style={{ fontSize: "15px", fontWeight: 700 }}
                    >
                      New Users
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate("/admin?tab=users")}
                    className="flex items-center gap-1.5 text-purple-500 hover:underline"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.fullName
                          ? user.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : user.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-slate-900 dark:text-slate-200 truncate font-semibold"
                          style={{ fontSize: "13px" }}
                        >
                          {user.fullName || user.username || "—"}
                        </p>
                        <p
                          className="text-slate-400 truncate"
                          style={{ fontSize: "11px" }}
                        >
                          {user.email}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : user.status === "SUSPENDED"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {user.status?.replace("_", " ") || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Scans */}
            {recentJobs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <h2
                      className="text-slate-900 dark:text-white"
                      style={{ fontSize: "15px", fontWeight: 700 }}
                    >
                      Recent Scans
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate("/admin?tab=scan-jobs")}
                    className="flex items-center gap-1.5 text-purple-500 hover:underline"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {recentJobs.map((job) => (
                    <div
                      key={job.scanJobId}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        {getFileIcon(job.fileName?.split(".").pop() || "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-slate-900 dark:text-slate-200 truncate font-semibold"
                          style={{ fontSize: "13px" }}
                        >
                          {job.fileName}
                        </p>
                        <p
                          className="text-slate-400 truncate"
                          style={{ fontSize: "11px" }}
                        >
                          {job.email}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          job.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : job.status === "PROCESSING"
                              ? "bg-blue-500/10 text-blue-500"
                              : job.status === "FAILED"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {job.status === "PROCESSING" && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Welcome message ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20"
          >
            <h3
              className="text-slate-900 dark:text-white mb-2"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              👋 Welcome, {profile?.fullName || "Administrator"}
            </h3>
            <p
              className="text-slate-600 dark:text-slate-300"
              style={{ fontSize: "14px" }}
            >
              You have full access to system analytics, user management, and
              monitoring tools. Visit the{" "}
              <button
                onClick={() => navigate("/admin/analytics")}
                className="text-purple-500 hover:underline font-semibold"
              >
                Analytics page
              </button>{" "}
              for detailed reports. System is tracking{" "}
              <strong>{formatNumber(totalScans)}</strong> scan jobs and{" "}
              <strong>{formatNumber(totalMedia)}</strong> media files across{" "}
              <strong>{formatNumber(fullUserStats?.totalUsers || 0)}</strong>{" "}
              users.
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}

/* ── Regular User Dashboard ── */
function UserDashboardView() {
  const navigate = useNavigate();
  const { profile, userInfo } = useAuth();

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-[#2563EB]" />
            <h1
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Overview
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            — Welcome back, {profile?.fullName || userInfo?.username || "User"}
          </p>
        </div>
        <button
          onClick={() => navigate("/detect")}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
          style={{ fontSize: "14px", fontWeight: 700 }}
        >
          <ScanSearch className="w-4 h-4" />
          New Detection
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Scans",
            value: "2,847",
            sub: "+24 today",
            icon: Cpu,
            color: "#2563EB",
            bg: "bg-[#2563EB]/10",
            trend: "+8%",
          },
          {
            label: "Deepfakes Found",
            value: "987",
            sub: "34.7% detection rate",
            icon: AlertTriangle,
            color: "#EF4444",
            bg: "bg-red-500/10",
            trend: "+3%",
          },
          {
            label: "Authentic Files",
            value: "1,080",
            sub: "37.9% of all scans",
            icon: Shield,
            color: "#10B981",
            bg: "bg-emerald-500/10",
            trend: "-2%",
          },
          {
            label: "Avg Risk Score",
            value: "54.2%",
            sub: "Across all media types",
            icon: Activity,
            color: "#F59E0B",
            bg: "bg-amber-500/10",
            trend: "+3.1%",
          },
        ].map(({ label, value, sub, icon: Icon, color, bg, trend }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span
                  className="text-emerald-500"
                  style={{ fontSize: "11px", fontWeight: 700 }}
                >
                  {trend}
                </span>
              </div>
            </div>
            <p
              className="text-slate-900 dark:text-white mb-0.5"
              style={{
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.5px",
              }}
            >
              {value}
            </p>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              {label}
            </p>
            <p
              className="text-slate-400 dark:text-slate-600 mt-0.5"
              style={{ fontSize: "11px" }}
            >
              {sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts + Recent row */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Scan trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-slate-900 dark:text-white"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                Scan Activity
              </h2>
              <p
                className="text-slate-400 dark:text-slate-500"
                style={{ fontSize: "13px" }}
              >
                Files scanned this week
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span
                className="text-emerald-500"
                style={{ fontSize: "12px", fontWeight: 700 }}
              >
                +18% vs last week
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={scanTrend}>
              <defs>
                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#64748B", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                formatter={(val: number) => [val, "Scans"]}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#scanGrad)"
                dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#22D3EE" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Alerts panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <h2
                className="text-slate-900 dark:text-white"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                Alerts
              </h2>
              <span
                className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white"
                style={{ fontSize: "10px", fontWeight: 800 }}
              >
                3
              </span>
            </div>
            <button
              className="text-[#2563EB] dark:text-[#22D3EE]"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Clear all
            </button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`flex gap-3 p-3 rounded-xl border ${alert.color} bg-opacity-10`}
              >
                <div className="flex-1">
                  <p
                    className="text-slate-700 dark:text-slate-300"
                    style={{ fontSize: "12px", lineHeight: 1.5 }}
                  >
                    {alert.msg}
                  </p>
                  <p
                    className="text-slate-400 mt-1"
                    style={{ fontSize: "11px" }}
                  >
                    {alert.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
            <p
              className="text-slate-500 dark:text-slate-500 mb-3"
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Quick Actions
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Detect New File",
                  icon: ScanSearch,
                  action: () => navigate("/detect"),
                },
                {
                  label: "View Analytics",
                  icon: BarChart2,
                  action: () => navigate("/analytics"),
                },
                {
                  label: "Browse History",
                  icon: Clock,
                  action: () => navigate("/history"),
                },
              ].map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                    <span
                      className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      {label}
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-700 group-hover:text-[#2563EB] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent scans table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#22D3EE]" />
            <h2
              className="text-slate-900 dark:text-white"
              style={{ fontSize: "15px", fontWeight: 700 }}
            >
              Recent Scans
            </h2>
          </div>
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-1.5 text-[#2563EB] dark:text-[#22D3EE] hover:underline"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          {recentScans.map((scan, i) => {
            const TypeIcon = typeIcon[scan.type];
            const VStyle = verdictStyle[scan.verdict];
            const riskColor =
              scan.risk >= 70
                ? "text-red-500"
                : scan.risk >= 31
                  ? "text-amber-500"
                  : "text-emerald-500";
            const riskBar =
              scan.risk >= 70
                ? "bg-red-500"
                : scan.risk >= 31
                  ? "bg-amber-500"
                  : "bg-emerald-500";

            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="grid items-center px-6 py-3.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                style={{
                  gridTemplateColumns: "1fr 80px 100px 120px 110px 80px",
                }}
                onClick={() => navigate("/results")}
              >
                {/* File */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-slate-900 dark:text-slate-200 truncate"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      {scan.name}
                    </p>
                    <p className="text-slate-400" style={{ fontSize: "11px" }}>
                      {scan.type}
                    </p>
                  </div>
                </div>

                {/* Risk */}
                <div>
                  <span
                    className={`${riskColor}`}
                    style={{ fontSize: "13px", fontWeight: 800 }}
                  >
                    {scan.risk}%
                  </span>
                  <div className="mt-1 h-1 w-10 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${riskBar}`}
                      style={{ width: `${scan.risk}%` }}
                    />
                  </div>
                </div>

                {/* Verdict */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${VStyle.bg} w-fit`}
                >
                  <VStyle.icon className={`w-3 h-3 ${VStyle.text}`} />
                  <span
                    className={`${VStyle.text}`}
                    style={{ fontSize: "11px", fontWeight: 700 }}
                  >
                    {scan.verdict}
                  </span>
                </div>

                {/* Date */}
                <span
                  className="text-slate-400 dark:text-slate-500"
                  style={{ fontSize: "12px" }}
                >
                  {scan.date}
                </span>

                {/* Model */}
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                  <span
                    className="text-slate-400 dark:text-slate-600"
                    style={{ fontSize: "11px" }}
                  >
                    7 AI Models
                  </span>
                </div>

                {/* View */}
                <button
                  className="flex items-center gap-1 text-slate-300 dark:text-slate-700 group-hover:text-[#2563EB] dark:group-hover:text-[#22D3EE] transition-colors"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

/* ── Main Export ── */
export function DashboardHome() {
  const { isAdmin } = useAuthorizationCheck();

  if (isAdmin) {
    return (
      <DashboardLayout>
        <AdminDashboardView />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <UserDashboardView />
      </div>
    </DashboardLayout>
  );
}
