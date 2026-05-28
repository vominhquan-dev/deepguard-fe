import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../auth/context/AuthContext";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import {
  getScanJobs,
  getAdminMedia,
  getDetectionResults,
  ScanJob,
  AdminMediaItem,
  DetectionResultItem,
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
} from "lucide-react";

/* ────── Helpers ────── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
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
    label: "Queued",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  PROCESSING: {
    icon: Loader2,
    label: "Processing",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  FAILED: {
    icon: XCircle,
    label: "Failed",
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
    label: "Real",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  FAKE: {
    icon: AlertTriangle,
    label: "Fake",
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
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
      <span
        className="text-slate-400 dark:text-slate-500"
        style={{ fontSize: "12px" }}
      >
        Page {page + 1} of {totalPages}
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

/* ────── Sub-tables ────── */

function ScanJobsTable() {
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
          <span style={{ fontSize: "12px", fontWeight: 600 }}>Status:</span>
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
            {s || "All"}
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
          No scan jobs found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  File
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Started
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Finished
                </th>
                <th className="text-right py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Actions
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
                          {cfg.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(job.startedAt)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(job.finishedAt)}
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
          No media found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  File
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Size
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="text-right py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Actions
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
                      {item.fileType || "Unknown"}
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
                        {formatDate(item.uploadedAt)}
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
                      Open
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
          <span style={{ fontSize: "12px", fontWeight: 600 }}>Label:</span>
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
            {l || "All"}
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
          No detection results found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  File
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Fake Score
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Confidence
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Result
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Model
                </th>
                <th className="text-left py-3 px-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  Processed
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const cfg = resultLabelConfig[item.resultLabel] || {
                  icon: AlertTriangle,
                  label: item.resultLabel,
                  color: "text-slate-500",
                  bg: "bg-slate-500/10",
                };
                const ResultIcon = cfg.icon;
                const isHighFake = item.fakeScore >= 70;
                const isMidFake = item.fakeScore >= 31;
                const scoreColor = isHighFake
                  ? "text-red-500"
                  : isMidFake
                    ? "text-amber-500"
                    : "text-emerald-500";
                const scoreBar = isHighFake
                  ? "bg-red-500"
                  : isMidFake
                    ? "bg-amber-500"
                    : "bg-emerald-500";

                return (
                  <tr
                    key={item.detectionResultId}
                    className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(item.fileName?.split(".").pop() || "")}
                        </div>
                        <div className="min-w-0 max-w-[180px]">
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
                          {item.fakeScore}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreBar}`}
                            style={{ width: `${item.fakeScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-500 font-semibold"
                        style={{ fontSize: "13px" }}
                      >
                        {item.confidence}%
                      </span>
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
                          {cfg.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-500 text-xs font-mono">
                        {item.modelVersion || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "12px" }}
                      >
                        {formatDate(item.processedAt)}
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
  { key: "scan-jobs", label: "Scan Jobs", icon: FileText },
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "detection-results", label: "Detection Results", icon: AlertTriangle },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ────── Page ────── */

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("scan-jobs");

  const renderTabContent = () => {
    switch (activeTab) {
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
              Admin Panel
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            System administration & data management
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
              {label}
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
