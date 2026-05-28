import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
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
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Image as ImageIcon,
  Video,
  Mic,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  HardDrive,
  Layers,
  LineChart,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  getScanJobs,
  getAdminMedia,
  getDetectionResults,
  ScanJob,
  AdminMediaItem,
  DetectionResultItem,
} from "../../admin/api/adminApi";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-3 shadow-xl">
        <p
          className="text-slate-300 mb-2"
          style={{ fontSize: "12px", fontWeight: 600 }}
        >
          {label}
        </p>
        {payload.map((entry: any) => (
          <p
            key={entry.name}
            style={{ color: entry.color, fontSize: "13px", fontWeight: 700 }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = [
  "#2563EB",
  "#22D3EE",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#10B981",
];
const STATUS_COLORS: Record<string, string> = {
  QUEUED: "#F59E0B",
  PROCESSING: "#2563EB",
  COMPLETED: "#10B981",
  FAILED: "#EF4444",
};
const LABEL_COLORS: Record<string, string> = {
  REAL: "#10B981",
  FAKE: "#EF4444",
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function Analytics() {
  const { accessToken } = useAuth();
  const [scanJobs, setScanJobs] = useState<ScanJob[]>([]);
  const [mediaItems, setMediaItems] = useState<AdminMediaItem[]>([]);
  const [results, setResults] = useState<DetectionResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    Promise.all([
      getScanJobs(accessToken, 0, 1000),
      getAdminMedia(accessToken, { page: 0, size: 1000 }),
      getDetectionResults(accessToken, 0, 1000),
    ])
      .then(([jobsRes, mediaRes, resultsRes]) => {
        if (jobsRes.success) setScanJobs(jobsRes.data.content);
        if (mediaRes.success) setMediaItems(mediaRes.data.content);
        if (resultsRes.success) setResults(resultsRes.data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const {
    totalScans,
    totalDeepfakes,
    totalAuthentic,
    avgFakeScore,
    avgConfidence,
    statusData,
    statusCounts,
    typeData,
    weeklyData,
    weeklyUploads,
    trendData,
    sizeBuckets,
    modelData,
    processedToday,
    avgProcessingTime,
  } = useMemo(() => {
    const total = results.length;
    const fake = results.filter((r) => r.resultLabel === "FAKE");
    const real = results.filter((r) => r.resultLabel === "REAL");
    const avgScore =
      total > 0 ? results.reduce((sum, r) => sum + r.fakeScore, 0) / total : 0;
    const avgConf =
      total > 0 ? results.reduce((sum, r) => sum + r.confidence, 0) / total : 0;

    // Scan job status distribution
    const statusBuckets: Record<string, number> = {};
    scanJobs.forEach((j) => {
      statusBuckets[j.status] = (statusBuckets[j.status] || 0) + 1;
    });
    const statusArr = Object.entries(statusBuckets).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name] || "#64748B",
    }));
    const sCounts = {
      queued: statusBuckets["QUEUED"] || 0,
      processing: statusBuckets["PROCESSING"] || 0,
      completed: statusBuckets["COMPLETED"] || 0,
      failed: statusBuckets["FAILED"] || 0,
    };

    // Media file type distribution
    const typeBuckets: Record<string, number> = {};
    mediaItems.forEach((m) => {
      const t = m.fileType || "UNKNOWN";
      typeBuckets[t] = (typeBuckets[t] || 0) + 1;
    });
    const typeArr = Object.entries(typeBuckets)
      .map(([name, value], i) => ({
        name: name.toUpperCase(),
        value,
        fill: PIE_COLORS[i % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    // Media upload activity by day of week
    const dayBuckets: Record<string, number> = {};
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach((d) => (dayBuckets[d] = 0));
    mediaItems.forEach((m) => {
      try {
        const date = new Date(m.uploadedAt);
        dayBuckets[dayNames[date.getDay()]]++;
      } catch {
        // skip
      }
    });
    const weeklyUploads = dayNames.map((day) => ({
      day,
      uploads: dayBuckets[day],
    }));

    // Weekly detection activity (from detection results)
    const detDayBuckets: Record<
      string,
      { scans: number; deepfakes: number; authentic: number }
    > = {};
    dayNames.forEach(
      (d) => (detDayBuckets[d] = { scans: 0, deepfakes: 0, authentic: 0 }),
    );
    results.forEach((r) => {
      try {
        const date = new Date(r.processedAt);
        const dayName = dayNames[date.getDay()];
        detDayBuckets[dayName].scans++;
        if (r.resultLabel === "FAKE") detDayBuckets[dayName].deepfakes++;
        else if (r.resultLabel === "REAL") detDayBuckets[dayName].authentic++;
      } catch {
        // skip
      }
    });
    const weeklyDetections = dayNames.map((day) => ({
      day,
      ...detDayBuckets[day],
    }));

    // Monthly deepfake rate trend (from detection results)
    const monthBuckets: Record<string, { total: number; fake: number }> = {};
    results.forEach((r) => {
      try {
        const date = new Date(r.processedAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthBuckets[key]) monthBuckets[key] = { total: 0, fake: 0 };
        monthBuckets[key].total++;
        if (r.resultLabel === "FAKE") monthBuckets[key].fake++;
      } catch {
        // skip
      }
    });
    const sortedMonths = Object.entries(monthBuckets).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const monthLabels: Record<string, string> = {
      "01": "Jan",
      "02": "Feb",
      "03": "Mar",
      "04": "Apr",
      "05": "May",
      "06": "Jun",
      "07": "Jul",
      "08": "Aug",
      "09": "Sep",
      "10": "Oct",
      "11": "Nov",
      "12": "Dec",
    };
    const trendArr = sortedMonths.map(([month, { total, fake }]) => ({
      month: monthLabels[month.slice(5)] || month.slice(5),
      rate: total > 0 ? Math.round((fake / total) * 100) : 0,
    }));

    // File size distribution (from media items)
    const sizeBucketsArr = [
      { range: "< 1 MB", count: 0, fill: "#2563EB" },
      { range: "1–5 MB", count: 0, fill: "#22D3EE" },
      { range: "5–20 MB", count: 0, fill: "#8B5CF6" },
      { range: "20–100 MB", count: 0, fill: "#F59E0B" },
      { range: "> 100 MB", count: 0, fill: "#EF4444" },
    ];
    mediaItems.forEach((m) => {
      const mb = m.fileSize / (1024 * 1024);
      if (mb < 1) sizeBucketsArr[0].count++;
      else if (mb < 5) sizeBucketsArr[1].count++;
      else if (mb < 20) sizeBucketsArr[2].count++;
      else if (mb < 100) sizeBucketsArr[3].count++;
      else sizeBucketsArr[4].count++;
    });

    // Model version usage (from detection results)
    const modelBuckets: Record<string, number> = {};
    results.forEach((r) => {
      const v = r.modelVersion || "Unknown";
      modelBuckets[v] = (modelBuckets[v] || 0) + 1;
    });
    const modelArr = Object.entries(modelBuckets)
      .map(([name, value], i) => ({
        name,
        value,
        fill: PIE_COLORS[i % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    // Processed today
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const processedTodayCount = results.filter((r) => {
      try {
        return r.processedAt.slice(0, 10) === todayStr;
      } catch {
        return false;
      }
    }).length;

    // Avg processing time from scan jobs (finishedAt - startedAt)
    let totalTime = 0;
    let timeCount = 0;
    scanJobs.forEach((j) => {
      if (j.startedAt && j.finishedAt) {
        try {
          const diff =
            new Date(j.finishedAt).getTime() - new Date(j.startedAt).getTime();
          if (diff > 0) {
            totalTime += diff;
            timeCount++;
          }
        } catch {
          // skip
        }
      }
    });
    const avgTime =
      timeCount > 0 ? Math.round(totalTime / timeCount / 1000) : 0;

    return {
      totalScans: total,
      totalDeepfakes: fake.length,
      totalAuthentic: real.length,
      avgFakeScore: Math.round(avgScore * 10) / 10,
      avgConfidence: Math.round(avgConf * 10) / 10,
      statusData: statusArr,
      statusCounts: sCounts,
      typeData: typeArr,
      weeklyData: weeklyDetections,
      weeklyUploads,
      trendData: trendArr,
      sizeBuckets: sizeBucketsArr,
      modelData: modelArr,
      processedToday: processedTodayCount,
      avgProcessingTime: avgTime,
      scanJobTotal: scanJobs.length,
      mediaTotal: mediaItems.length,
    };
  }, [scanJobs, mediaItems, results]);

  const fakePct =
    totalScans > 0
      ? Math.round((totalDeepfakes / totalScans) * 100 * 10) / 10
      : 0;
  const totalMediaSize = mediaItems.reduce((s, m) => s + (m.fileSize || 0), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400" style={{ fontSize: "14px" }}>
              Loading analytics data...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-[#22D3EE]" />
            <h1
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Analytics
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            Platform-wide deepfake detection insights from scan jobs, media, and
            detection results
          </p>
        </div>

        {/* Row 1: Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card: Total Detections */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 }}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="flex items-center gap-1" />
            </div>
            <p
              className="text-slate-900 dark:text-white mb-0.5"
              style={{
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.5px",
              }}
            >
              {totalScans.toLocaleString()}
            </p>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Total Detections
            </p>
            <p
              className="text-slate-400 dark:text-slate-600 mt-1"
              style={{ fontSize: "11px" }}
            >
              {processedToday} processed today
            </p>
          </motion.div>

          {/* Card: Scan Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex items-center gap-1" />
            </div>
            <p
              className="text-slate-900 dark:text-white mb-0.5"
              style={{
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.5px",
              }}
            >
              {scanJobs.length.toLocaleString()}
            </p>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Scan Jobs
            </p>
            <p
              className="text-slate-400 dark:text-slate-600 mt-1"
              style={{ fontSize: "11px" }}
            >
              {statusCounts.completed} completed · {statusCounts.failed} failed
            </p>
          </motion.div>

          {/* Card: Media Files */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-purple-500" />
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
              {mediaItems.length.toLocaleString()}
            </p>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Media Files
            </p>
            <p
              className="text-slate-400 dark:text-slate-600 mt-1"
              style={{ fontSize: "11px" }}
            >
              Total {formatBytes(totalMediaSize)}
            </p>
          </motion.div>

          {/* Card: Avg Processing */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-500" />
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
              {avgProcessingTime > 60
                ? `${Math.round(avgProcessingTime / 60)}m`
                : `${avgProcessingTime}s`}
            </p>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Avg. Processing
            </p>
            <p
              className="text-slate-400 dark:text-slate-600 mt-1"
              style={{ fontSize: "11px" }}
            >
              Per scan job
            </p>
          </motion.div>
        </div>

        {/* Stats sub-cards row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                Authentic
              </span>
            </div>
            <span
              className="text-slate-900 dark:text-white ml-auto"
              style={{ fontSize: "15px", fontWeight: 800 }}
            >
              {totalAuthentic.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                Deepfakes
              </span>
            </div>
            <span
              className="text-slate-900 dark:text-white ml-auto"
              style={{ fontSize: "15px", fontWeight: 800 }}
            >
              {totalDeepfakes.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                Avg. Fake Score
              </span>
            </div>
            <span
              className="text-slate-900 dark:text-white ml-auto"
              style={{ fontSize: "15px", fontWeight: 800 }}
            >
              {avgFakeScore}%
            </span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                Avg. Confidence
              </span>
            </div>
            <span
              className="text-slate-900 dark:text-white ml-auto"
              style={{ fontSize: "15px", fontWeight: 800 }}
            >
              {avgConfidence}%
            </span>
          </div>
        </div>

        {/* Row 2: Charts */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          {/* Scan Jobs Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Scan Job Status
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-4"
              style={{ fontSize: "13px" }}
            >
              Current status distribution
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={
                    statusData.length > 0
                      ? statusData
                      : [{ name: "No Data", value: 1, fill: "#334155" }]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(statusData.length > 0
                    ? statusData
                    : [{ name: "No Data", value: 1, fill: "#334155" }]
                  ).map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [val, ""]}
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {[
                {
                  label: "Completed",
                  key: "completed" as const,
                  color: STATUS_COLORS.COMPLETED,
                },
                {
                  label: "Processing",
                  key: "processing" as const,
                  color: STATUS_COLORS.PROCESSING,
                },
                {
                  label: "Queued",
                  key: "queued" as const,
                  color: STATUS_COLORS.QUEUED,
                },
                {
                  label: "Failed",
                  key: "failed" as const,
                  color: STATUS_COLORS.FAILED,
                },
              ].map(({ label, key, color }) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="text-slate-600 dark:text-slate-400"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-slate-900 dark:text-white ml-auto"
                    style={{ fontSize: "13px", fontWeight: 800 }}
                  >
                    {statusCounts[key].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Media Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Media Types
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-4"
              style={{ fontSize: "13px" }}
            >
              File type distribution
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={
                    typeData.length > 0
                      ? typeData
                      : [{ name: "No Data", value: 1, fill: "#334155" }]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(typeData.length > 0
                    ? typeData
                    : [{ name: "No Data", value: 1, fill: "#334155" }]
                  ).map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [val, ""]}
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto">
              {typeData.slice(0, 5).map(({ name, value, fill }) => (
                <div key={name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: fill }}
                  />
                  <span
                    className="text-slate-600 dark:text-slate-400 truncate"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {name}
                  </span>
                  <span
                    className="text-slate-900 dark:text-white ml-auto"
                    style={{ fontSize: "13px", fontWeight: 800 }}
                  >
                    {value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Model Version */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Model Versions
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-4"
              style={{ fontSize: "13px" }}
            >
              Detection model usage
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={
                    modelData.length > 0
                      ? modelData
                      : [{ name: "No Data", value: 1, fill: "#334155" }]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(modelData.length > 0
                    ? modelData
                    : [{ name: "No Data", value: 1, fill: "#334155" }]
                  ).map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [val, ""]}
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto">
              {modelData.slice(0, 5).map(({ name, value, fill }) => (
                <div key={name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: fill }}
                  />
                  <span
                    className="text-slate-600 dark:text-slate-400 truncate"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    {name}
                  </span>
                  <span
                    className="text-slate-900 dark:text-white ml-auto"
                    style={{ fontSize: "13px", fontWeight: 800 }}
                  >
                    {value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 3: Weekly + Trend */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          {/* Weekly Detection Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-slate-900 dark:text-white"
                  style={{ fontSize: "16px", fontWeight: 700 }}
                >
                  Weekly Detection Activity
                </h2>
                <p
                  className="text-slate-400 dark:text-slate-500"
                  style={{ fontSize: "13px" }}
                >
                  Scans vs deepfakes by day
                </p>
              </div>
              <div className="flex gap-3">
                {[
                  { label: "Total", color: "#2563EB" },
                  { label: "Deepfakes", color: "#EF4444" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barGap={4} barCategoryGap="30%">
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
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(37,99,235,0.05)" }}
                />
                <Bar
                  dataKey="scans"
                  name="Total"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
                <Bar
                  dataKey="deepfakes"
                  name="Deepfakes"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Monthly Detection Rate Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Deepfake Detection Rate
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-5"
              style={{ fontSize: "13px" }}
            >
              Monthly % of deepfakes detected
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, "Detection Rate"]}
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  fill="url(#rateGradient)"
                  dot={{ fill: "#EF4444", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Row 4: File Size + Media Uploads */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* File Size Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              File Size Distribution
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-5"
              style={{ fontSize: "13px" }}
            >
              Media file size breakdown
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={sizeBuckets}
                barGap={4}
                barCategoryGap="25%"
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.1)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="range"
                  type="category"
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />
                <Tooltip
                  formatter={(val: number) => [val.toLocaleString(), "Files"]}
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {sizeBuckets.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Media Upload Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Media Upload Activity
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-5"
              style={{ fontSize: "13px" }}
            >
              Uploads by day of week
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyUploads}>
                <defs>
                  <linearGradient
                    id="uploadGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
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
                  formatter={(val: number) => [val.toLocaleString(), "Uploads"]}
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uploads"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fill="url(#uploadGradient)"
                  dot={{ fill: "#8B5CF6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
