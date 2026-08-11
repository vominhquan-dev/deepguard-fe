import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useTranslation } from "react-i18next";
import { getScanJobs, getAdminMedia, getBillingHistory } from "../api/adminApi";
import {
  Loader2,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Image as ImageIcon,
  Video,
  Mic,
  File,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  QUEUED: "#F59E0B",
  PROCESSING: "#3B82F6",
  COMPLETED: "#10B981",
  FAILED: "#EF4444",
};

const FILE_TYPE_COLORS: Record<string, string> = {
  image: "#8B5CF6",
  video: "#EC4899",
  audio: "#F59E0B",
  other: "#6B7280",
};

function getFileCategory(fileType: string): string {
  const t = fileType?.toLowerCase() || "";
  if (t.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(t))
    return "image";
  if (t.includes("video") || ["mp4", "mov", "avi", "mkv"].includes(t))
    return "video";
  if (t.includes("audio") || ["mp3", "wav", "ogg", "flac"].includes(t))
    return "audio";
  return "other";
}

/* ────── Stat Card ────── */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div
        className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p
          className="text-slate-900 dark:text-white font-extrabold"
          style={{ fontSize: "18px" }}
        >
          {value}
        </p>
        <p
          className="text-slate-400 dark:text-slate-500"
          style={{ fontSize: "11px", fontWeight: 600 }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* ────── Custom Tooltip ────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
        {label}
      </p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-900 dark:text-slate-200 font-medium">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ────── Main Analytics Component ────── */
export function AnalyticsTab() {
  const { t, i18n } = useTranslation();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScanJobs: 0,
    totalMedia: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [statusChartData, setStatusChartData] = useState<any[]>([]);
  const [dailyJobsData, setDailyJobsData] = useState<any[]>([]);
  const [fileTypeData, setFileTypeData] = useState<any[]>([]);
  const [scanJobsTrend, setScanJobsTrend] = useState<any[]>([]);

  /* ────── Billing State ────── */
  const [billingStats, setBillingStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
  });
  const [dailyRevenueData, setDailyRevenueData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<any[]>([]);
  const [billingPlanData, setBillingPlanData] = useState<any[]>([]);

  const fetchAnalytics = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      // Fetch large batches to get meaningful data
      const [scanRes, mediaRes] = await Promise.all([
        getScanJobs(accessToken, 0, 1000),
        getAdminMedia(accessToken, { page: 0, size: 1000 }),
      ]);

      const jobs = scanRes.success ? scanRes.data.content : [];
      const media = mediaRes.success ? mediaRes.data.content : [];

      /* ── Status distribution ── */
      const queued = jobs.filter((j: any) => j.status === "QUEUED").length;
      const processing = jobs.filter(
        (j: any) => j.status === "PROCESSING",
      ).length;
      const completed = jobs.filter(
        (j: any) => j.status === "COMPLETED",
      ).length;
      const failed = jobs.filter((j: any) => j.status === "FAILED").length;

      setStats({
        totalScanJobs: jobs.length,
        totalMedia: media.length,
        queued,
        processing,
        completed,
        failed,
      });

      setStatusChartData([
        {
          name: t("admin.ui.queued"),
          value: queued,
          color: STATUS_COLORS.QUEUED,
        },
        {
          name: t("admin.ui.processing"),
          value: processing,
          color: STATUS_COLORS.PROCESSING,
        },
        {
          name: t("admin.ui.completed"),
          value: completed,
          color: STATUS_COLORS.COMPLETED,
        },
        { name: t("admin.ui.failed"), value: failed, color: STATUS_COLORS.FAILED },
      ]);

      /* ── Daily scan jobs (last 7 days) ── */
      const now = Date.now();
      const oneDay = 86400000;
      const dailyMap: Record<
        string,
        { date: string; total: number; completed: number; failed: number }
      > = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * oneDay);
        const key = d.toISOString().slice(0, 10);
        dailyMap[key] = { date: key, total: 0, completed: 0, failed: 0 };
      }
      jobs.forEach((job: any) => {
        const started = job.startedAt
          ? new Date(job.startedAt).toISOString().slice(0, 10)
          : null;
        if (started && dailyMap[started]) {
          dailyMap[started].total += 1;
          if (job.status === "COMPLETED") dailyMap[started].completed += 1;
          if (job.status === "FAILED") dailyMap[started].failed += 1;
        }
      });
      setDailyJobsData(
        Object.values(dailyMap).map((d) => ({
          date: new Date(d.date + "T00:00:00").toLocaleDateString(i18n.resolvedLanguage === "vi" ? "vi-VN" : "en-US", {
            month: "short",
            day: "numeric",
          }),
          Total: d.total,
          Completed: d.completed,
          Failed: d.failed,
        })),
      );

      /* ── File type distribution ── */
      const typeCount: Record<string, number> = {};
      media.forEach((m: any) => {
        const cat = getFileCategory(m.fileType);
        typeCount[cat] = (typeCount[cat] || 0) + 1;
      });
      setFileTypeData(
        Object.entries(typeCount).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value,
          color: FILE_TYPE_COLORS[key] || FILE_TYPE_COLORS.other,
        })),
      );

      /* ── Scan jobs by status over time (last 7 days stacked) ── */
      const trendMap: Record<string, any> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * oneDay);
        const key = d.toISOString().slice(0, 10);
        trendMap[key] = {
          date: new Date(key + "T00:00:00").toLocaleDateString(i18n.resolvedLanguage === "vi" ? "vi-VN" : "en-US", {
            month: "short",
            day: "numeric",
          }),
          Queued: 0,
          Processing: 0,
          Completed: 0,
          Failed: 0,
        };
      }
      jobs.forEach((job: any) => {
        const started = job.startedAt
          ? new Date(job.startedAt).toISOString().slice(0, 10)
          : null;
        if (
          started &&
          trendMap[started] &&
          trendMap[started][job.status] !== undefined
        ) {
          trendMap[started][job.status] += 1;
        }
      });
      setScanJobsTrend(Object.values(trendMap));

      /* ────── Billing Data ────── */
      const billingRes = await getBillingHistory(accessToken, {
        page: 0,
        size: 1000,
        sort: ["createdAt,desc"],
      });
      const payments = billingRes.success ? billingRes.data.content : [];

      const rev = payments.reduce(
        (sum: number, p: any) =>
          p.status === "SUCCESS" ? sum + (p.amount || 0) : sum,
        0,
      );
      const successCount = payments.filter(
        (p: any) => p.status === "SUCCESS",
      ).length;
      const pendCount = payments.filter(
        (p: any) => p.status === "PENDING",
      ).length;
      const failCount = payments.filter(
        (p: any) => p.status === "FAILED",
      ).length;
      const refundCount = payments.filter(
        (p: any) => p.status === "REFUNDED",
      ).length;
      const cancCount = payments.filter(
        (p: any) => p.status === "CANCELLED",
      ).length;

      setBillingStats({
        totalRevenue: rev,
        totalTransactions: payments.length,
        successCount,
        pendingCount: pendCount,
        failedCount: failCount,
        refundedCount: refundCount,
      });

      // Daily revenue (last 7 days)
      const revDailyMap: Record<string, any> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * oneDay);
        const key = d.toISOString().slice(0, 10);
        revDailyMap[key] = {
          date: new Date(key + "T00:00:00").toLocaleDateString(i18n.resolvedLanguage === "vi" ? "vi-VN" : "en-US", {
            month: "short",
            day: "numeric",
          }),
          Revenue: 0,
          Transactions: 0,
        };
      }
      payments.forEach((p: any) => {
        const createdAt = p.createdAt
          ? new Date(p.createdAt).toISOString().slice(0, 10)
          : null;
        if (createdAt && revDailyMap[createdAt]) {
          revDailyMap[createdAt].Transactions += 1;
          if (p.status === "SUCCESS") {
            revDailyMap[createdAt].Revenue += p.amount || 0;
          }
        }
      });
      setDailyRevenueData(Object.values(revDailyMap));

      // Payment method distribution
      const methodMap: Record<string, number> = {};
      payments.forEach((p: any) => {
        const m = p.paymentMethod || "Unknown";
        methodMap[m] = (methodMap[m] || 0) + 1;
      });
      const methodColors: Record<string, string> = {
        BANK_TRANSFER: "#3B82F6",
        CREDIT_CARD: "#8B5CF6",
        VNPAY: "#10B981",
        PAYPAL: "#F59E0B",
        MOMO: "#EC4899",
        Unknown: "#6B7280",
      };
      setPaymentMethodData(
        Object.entries(methodMap).map(([key, value]) => ({
          name:
            key === "BANK_TRANSFER"
              ? t("admin.ui.bankTransfer")
              : key === "CREDIT_CARD"
                ? t("admin.ui.creditCard")
                : key === "Unknown"
                  ? t("admin.ui.unknown")
                  : key.charAt(0).toUpperCase() + key.slice(1),
          value,
          color: methodColors[key] || "#6B7280",
        })),
      );

      // Payment status distribution
      setPaymentStatusData([
        {
          name: t("admin.ui.success"),
          value: successCount,
          color: "#10B981",
        },
        { name: t("admin.pending"), value: pendCount, color: "#F59E0B" },
        { name: t("admin.ui.failed"), value: failCount, color: "#EF4444" },
        { name: t("admin.ui.cancelled"), value: cancCount, color: "#6B7280" },
        { name: t("admin.ui.refunded"), value: refundCount, color: "#8B5CF6" },
      ]);

      // Plan distribution
      const planMap: Record<string, number> = {};
      payments.forEach((p: any) => {
        const plan = p.pricingPlanName || t("admin.ui.unknown");
        planMap[plan] = (planMap[plan] || 0) + 1;
      });
      const planColors = [
        "#3B82F6",
        "#8B5CF6",
        "#10B981",
        "#F59E0B",
        "#EC4899",
        "#6B7280",
      ];
      setBillingPlanData(
        Object.entries(planMap).map(([key, value], idx) => ({
          name: key,
          value,
          color: planColors[idx % planColors.length],
        })),
      );
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, i18n.resolvedLanguage]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  const hasData = stats.totalScanJobs > 0 || stats.totalMedia > 0;

  if (!hasData) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p
          className="text-slate-400 dark:text-slate-500"
          style={{ fontSize: "14px" }}
        >
          {t("admin.ui.noAnalytics")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-slate-900 dark:text-white font-bold"
            style={{ fontSize: "18px" }}
          >
            {t("admin.ui.analyticsDashboard")}
          </h2>
          <p
            className="text-slate-400 dark:text-slate-500"
            style={{ fontSize: "13px" }}
          >
            {t("admin.ui.analyticsSubtitle")}
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
        >
          <Loader2 className="w-4 h-4" />
          {t("admin.ui.refresh")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("admin.ui.totalScanJobs")}
          value={stats.totalScanJobs}
          icon={BarChart3}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard
          label={t("admin.ui.totalMediaFiles")}
          value={stats.totalMedia}
          icon={ImageIcon}
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
        <StatCard
          label={t("admin.ui.completedFailed")}
          value={`${stats.completed} / ${stats.failed}`}
          icon={AlertTriangle}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatCard
          label={t("admin.ui.queuedProcessing")}
          value={`${stats.queued} / ${stats.processing}`}
          icon={TrendingUp}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* Charts Grid - Billing & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h3
            className="text-slate-900 dark:text-white font-bold mb-4"
            style={{ fontSize: "14px" }}
          >
            {t("admin.ui.dailyRevenue")}
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyRevenueData} barGap={2}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.3}
              />
              <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="Revenue"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name={t("admin.ui.revenue")}
              />
              <Bar
                dataKey="Transactions"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                name={t("admin.ui.transactions")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Method Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h3
            className="text-slate-900 dark:text-white font-bold mb-4"
            style={{ fontSize: "14px" }}
          >
            {t("admin.ui.paymentMethods")}
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {paymentMethodData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (
                  <span className="text-slate-500 dark:text-slate-400">
                    {value}
                  </span>
                )}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h3
            className="text-slate-900 dark:text-white font-bold mb-4"
            style={{ fontSize: "14px" }}
          >
            {t("admin.ui.paymentStatusDistribution")}
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Pie
                data={paymentStatusData.filter((d) => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {paymentStatusData
                  .filter((d) => d.value > 0)
                  .map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (
                  <span className="text-slate-500 dark:text-slate-400">
                    {value}
                  </span>
                )}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Pricing Plan Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h3
            className="text-slate-900 dark:text-white font-bold mb-4"
            style={{ fontSize: "14px" }}
          >
            {t("admin.ui.pricingPlanDistribution")}
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Pie
                data={billingPlanData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {billingPlanData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (
                  <span className="text-slate-500 dark:text-slate-400">
                    {value}
                  </span>
                )}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
