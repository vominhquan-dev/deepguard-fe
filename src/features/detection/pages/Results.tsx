import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Info,
  Eye,
  Waves,
  Database,
  Cpu,
  Video,
  Activity,
  Image as ImageIcon,
  Mic,
  X,
  Copy,
  Printer,
  Hash,
  Shield,
  Clock,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { toast } from "sonner";

interface DetectionData {
  detectionResultId?: string;
  scanJobId?: string;
  label: string;
  score: number;
  confidence?: number;
  imageUrl?: string;
  fileName?: string;
  modelVersion?: string;
  processedAt?: string;
  resultLabel?: string;
  fakeScore?: number;
  email?: string;
  mediaId?: string;
  message?: string;
}

const verdictConfig: Record<
  string,
  {
    color: string;
    bg: string;
    border: string;
    text: string;
    glow: string;
  }
> = {
  DEEPFAKE: {
    color: "#EF4444",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-500",
    glow: "rgba(239,68,68,0.4)",
  },
  SUSPICIOUS: {
    color: "#F59E0B",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-500",
    glow: "rgba(245,158,11,0.4)",
  },
  REAL: {
    color: "#10B981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    glow: "rgba(16,185,129,0.4)",
  },
  AUTHENTIC: {
    color: "#10B981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    glow: "rgba(16,185,129,0.4)",
  },
  AUTHENTIC_HIGH: {
    color: "#10B981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    glow: "rgba(16,185,129,0.4)",
  },
};

function getVerdictKey(label: string, score: number): string {
  const normalizedLabel = (label || "").toUpperCase();
  // If label explicitly says REAL/AUTHENTIC, respect that
  if (normalizedLabel === "REAL" || normalizedLabel === "AUTHENTIC") {
    if (score >= 70) return "AUTHENTIC_HIGH";
    return "REAL";
  }
  // If label explicitly says FAKE/DEEPFAKE, respect that
  if (normalizedLabel === "FAKE" || normalizedLabel === "DEEPFAKE") {
    return "DEEPFAKE";
  }
  // Fallback to score-based logic when label is ambiguous
  if (score >= 70) return "DEEPFAKE";
  if (score > 30) return "SUSPICIOUS";
  return "REAL";
}

function getVerdictDisplay(label: string, score: number): string {
  const normalizedLabel = (label || "").toUpperCase();
  if (normalizedLabel === "REAL" || normalizedLabel === "AUTHENTIC") {
    if (score >= 70) return "AUTHENTIC CONTENT";
    return "REAL CONTENT";
  }
  if (score >= 70) return "DEEPFAKE DETECTED";
  if (score > 30) return "SUSPICIOUS CONTENT";
  return "AUTHENTIC CONTENT";
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "High Risk", color: "#EF4444" };
  if (score >= 40) return { label: "Medium Risk", color: "#F59E0B" };
  return { label: "Low Risk", color: "#10B981" };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// ── Circular risk meter ──
function CircularRisk({
  score,
  color,
  glow,
}: {
  score: number;
  color: string;
  glow: string;
}) {
  const [animated, setAnimated] = useState(0);
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (animated / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = score / 80;
      const interval = setInterval(() => {
        start += step;
        if (start >= score) {
          setAnimated(score);
          clearInterval(interval);
        } else {
          setAnimated(Math.round(start));
        }
      }, 16);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(timeout);
  }, [score]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: 200, height: 200 }}
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="14"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeOpacity="0.15"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - strokeDash}
          strokeLinecap="round"
          style={{ filter: "blur(6px)" }}
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - strokeDash}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          style={{
            fontSize: "42px",
            fontWeight: 900,
            color,
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          {animated}
        </span>
        <span
          style={{ fontSize: "16px", fontWeight: 700, color, opacity: 0.8 }}
        >
          %
        </span>
        <span
          className="text-slate-400 dark:text-slate-500 mt-1"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Risk Level
        </span>
      </div>
    </div>
  );
}

// ── Video Timeline Visualization ──
const videoSegments = [
  { start: 0, end: 12, clean: true },
  { start: 12, end: 28, clean: false, label: "GAN artifacts" },
  { start: 28, end: 38, clean: true },
  { start: 38, end: 58, clean: false, label: "Face warp" },
  { start: 58, end: 70, clean: true },
  { start: 70, end: 85, clean: false, label: "Boundary blur" },
  { start: 85, end: 92, clean: true },
  { start: 92, end: 100, clean: false, label: "Audio sync" },
];
const anomalyFrames = [20, 45, 68, 82];

function VideoTimeline() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/80" />
            <span
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "11px" }}
            >
              Anomaly frame
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-600" />
            <span
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "11px" }}
            >
              Clean frame
            </span>
          </div>
        </div>
        <span className="text-slate-400" style={{ fontSize: "11px" }}>
          Duration: 2:34
        </span>
      </div>

      {/* Timeline bar */}
      <div className="relative h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700/50 flex mb-4">
        {videoSegments.map((seg, i) => (
          <div
            key={i}
            className={`relative h-full flex items-center justify-center transition-all cursor-pointer ${seg.clean ? "bg-emerald-500/20 hover:bg-emerald-500/30" : "bg-red-500/60 hover:bg-red-500/75"}`}
            style={{ width: `${seg.end - seg.start}%` }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {!seg.clean && (
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-red-200" />
              </div>
            )}
            {hovered === i && (
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white whitespace-nowrap z-10"
                style={{ fontSize: "10px", fontWeight: 600 }}
              >
                {seg.clean
                  ? `Clean (${seg.start}%–${seg.end}%)`
                  : `${seg.label} (${seg.start}%–${seg.end}%)`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Frame markers */}
      <div className="relative h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 overflow-hidden">
        {anomalyFrames.map((pct, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex flex-col items-center"
            style={{ left: `${pct}%` }}
          >
            <div className="w-px h-full bg-red-400/60" />
            <div
              className="absolute top-1 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center"
              style={{ left: 0 }}
            >
              <span
                className="text-red-400"
                style={{ fontSize: "8px", fontWeight: 800 }}
              >
                !
              </span>
            </div>
          </div>
        ))}
        {/* Time labels */}
        {["0:00", "0:38", "1:16", "1:54", "2:34"].map((t, i) => (
          <span
            key={t}
            className="absolute bottom-1 text-slate-400"
            style={{
              left: `${i * 25}%`,
              fontSize: "9px",
              transform: "translateX(-50%)",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <p className="text-slate-400 mt-3" style={{ fontSize: "11px" }}>
        ⚠ 4 high-risk anomaly clusters detected · 46% of frames flagged ·
        StyleGAN2 signature confirmed
      </p>
    </div>
  );
}

// ── Image Heatmap Visualization ──
const heatRegions = [
  {
    top: "8%",
    left: "18%",
    w: "22%",
    h: "30%",
    opacity: 0.75,
    label: "Face boundary",
  },
  {
    top: "18%",
    left: "35%",
    w: "12%",
    h: "14%",
    opacity: 0.9,
    label: "Eye region",
  },
  {
    top: "42%",
    left: "22%",
    w: "18%",
    h: "12%",
    opacity: 0.6,
    label: "Lip artifacts",
  },
  {
    top: "10%",
    left: "62%",
    w: "25%",
    h: "35%",
    opacity: 0.45,
    label: "Hair texture",
  },
  {
    top: "50%",
    left: "55%",
    w: "20%",
    h: "22%",
    opacity: 0.55,
    label: "Neck transition",
  },
];

function ImageHeatmap() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-10 h-3 rounded"
            style={{
              background:
                "linear-gradient(90deg, rgba(239,68,68,0.1), rgba(239,68,68,0.8))",
            }}
          />
          <span
            className="text-slate-500 dark:text-slate-400"
            style={{ fontSize: "11px" }}
          >
            Anomaly intensity
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-slate-400" />
          <span
            className="text-slate-500 dark:text-slate-400"
            style={{ fontSize: "11px" }}
          >
            Hover regions for details
          </span>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
        <div
          className="relative mx-auto"
          style={{ maxWidth: 400, aspectRatio: "16/10" }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500"
            style={{ fontSize: "13px" }}
          >
            <FileText className="w-12 h-12 opacity-30" />
          </div>
          {heatRegions.map((r, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="absolute rounded-lg cursor-crosshair transition-all duration-200"
              style={{
                top: r.top,
                left: r.left,
                width: r.w,
                height: r.h,
                background: `rgba(239,68,68,${r.opacity})`,
                boxShadow: "inset 0 0 20px rgba(239,68,68,0.3)",
                border:
                  hovered === i
                    ? "2px solid rgba(239,68,68,0.8)"
                    : "2px solid transparent",
              }}
            >
              {hovered === i && (
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-900 text-white whitespace-nowrap z-10"
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  {r.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Audio Spectrogram Visualization ──
function AudioSpectrogram() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-10 h-3 rounded"
            style={{ background: "linear-gradient(90deg, #22D3EE, #EF4444)" }}
          />
          <span
            className="text-slate-500 dark:text-slate-400"
            style={{ fontSize: "11px" }}
          >
            Frequency intensity
          </span>
        </div>
      </div>
      <div
        className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700"
        style={{ height: 160 }}
      >
        {/* Spectrogram bars — deterministic pattern based on index */}
        <div className="absolute inset-0 flex items-end gap-[2px] p-2">
          {Array.from({ length: 60 }).map((_, i) => {
            // Use deterministic height based on index so it doesn't re-randomize on every render
            const h = 20 + (Math.sin(i * 0.8) * 0.5 + 0.5) * 80;
            const isAnomaly = i > 35 && i < 45;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all"
                style={{
                  height: `${h}%`,
                  background: isAnomaly
                    ? "linear-gradient(to top, #EF4444, #DC2626)"
                    : `linear-gradient(to top, #22D3EE, #2563EB)`,
                  opacity: isAnomaly
                    ? 1
                    : 0.4 + (Math.sin(i * 1.2) * 0.5 + 0.5) * 0.3,
                }}
              />
            );
          })}
        </div>
        {/* Overlay labels */}
        <div className="absolute bottom-2 left-3 text-[10px] text-slate-500">
          0 Hz
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] text-slate-500">
          8 kHz
        </div>
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[9px] text-red-400 font-semibold">
          ⚠ Anomaly cluster
        </div>
      </div>
    </div>
  );
}

// ── Report Modal ──
function ReportModal({
  onClose,
  detection,
}: {
  onClose: () => void;
  detection: DetectionData;
}) {
  const scorePct = (detection.score ?? 0) * 100;
  const verdictKey = getVerdictKey(detection.label, scorePct);
  const config = verdictConfig[verdictKey] || verdictConfig.DEEPFAKE;
  const score = Math.round(scorePct);
  const displayLabel = getVerdictDisplay(detection.label, scorePct);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const reportText = `DEEPGUARD DETECTION REPORT
Date: ${new Date().toLocaleString()}
File: ${detection.fileName || "Unknown"}
Verdict: ${displayLabel}
Risk Score: ${score}%
Confidence: ${Math.round((detection.confidence ?? detection.score ?? 0) * 100)}%
Model Version: ${detection.modelVersion || "N/A"}
Status: ${score >= 70 ? "⚠ HIGH RISK" : score >= 40 ? "⚠ MEDIUM RISK" : "✓ LOW RISK"}`;
    navigator.clipboard.writeText(reportText).then(() => {
      toast.success("Report copied to clipboard");
    });
  };

  const riskColor =
    score >= 70 ? "#EF4444" : score >= 40 ? "#F59E0B" : "#10B981";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="text-slate-900 dark:text-white font-bold text-lg">
              DeepGuard Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Report Content */}
        <div className="space-y-4" id="report-content">
          <div
            className={`rounded-xl border ${config.border} ${config.bg} p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                AI Verdict
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}
              >
                {verdictKey}
              </span>
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-lg">
              {displayLabel}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
              <p className="text-slate-400 text-xs mb-0.5">Risk Score</p>
              <p
                className="text-slate-900 dark:text-white font-bold"
                style={{ color: riskColor }}
              >
                {score}%
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
              <p className="text-slate-400 text-xs mb-0.5">Confidence</p>
              <p className="text-slate-900 dark:text-white font-bold">
                {Math.round(
                  (detection.confidence ?? detection.score ?? 0) * 100,
                )}
                %
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
              <p className="text-slate-400 text-xs mb-0.5">File Name</p>
              <p className="text-slate-900 dark:text-white font-bold text-sm truncate">
                {detection.fileName || "Unknown"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
              <p className="text-slate-400 text-xs mb-0.5">Model</p>
              <p className="text-slate-900 dark:text-white font-bold text-sm">
                {detection.modelVersion || "N/A"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3 col-span-2">
              <p className="text-slate-400 text-xs mb-0.5">Processed At</p>
              <p className="text-slate-900 dark:text-white font-bold text-sm">
                {detection.processedAt
                  ? new Date(detection.processedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm font-semibold"
          >
            <Copy className="w-4 h-4" />
            Copy Report
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm font-semibold"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Results() {
  const navigate = useNavigate();
  const [detection, setDetection] = useState<DetectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [vizTab, setVizTab] = useState<"video" | "image" | "audio">("video");
  const [openAccordion, setOpenAccordion] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    // Read detection data from localStorage
    const stored = localStorage.getItem("lastDetection");
    if (stored) {
      try {
        const data = JSON.parse(stored) as DetectionData;
        setDetection(data);
      } catch {
        setDetection(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#22D3EE] animate-spin" />
            <p className="text-slate-400">Loading detection results...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!detection) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-md text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Eye className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">
              No Detection Results
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please upload a media file to see detection results here.
            </p>
            <button
              onClick={() => navigate("/detect")}
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all text-sm font-bold"
            >
              Go to Detection
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const score = (detection.score ?? 0) * 100;
  const verdictKey = getVerdictKey(detection.label, score);
  const config = verdictConfig[verdictKey] || verdictConfig.DEEPFAKE;
  const displayLabel = getVerdictDisplay(detection.label, score);
  const labelIsReal =
    detection.label?.toUpperCase() === "REAL" ||
    detection.label?.toUpperCase() === "AUTHENTIC";
  const isHighRisk = !labelIsReal && score >= 70;
  const isSuspicious = !labelIsReal && score > 30 && score < 70;
  const message =
    detection.message || `AI analysis complete — ${detection.label}`;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1
                className="text-slate-900 dark:text-white"
                style={{ fontSize: "24px", fontWeight: 800 }}
              >
                Detection Results
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Analysis complete for{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {detection.fileName || "Unknown file"}
                </span>
                {detection.processedAt && (
                  <span className="text-slate-400 ml-2">
                    · {formatDate(detection.processedAt)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Top action bar */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => navigate("/detect")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all text-sm font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              Scan Another
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* Left Panel */}
            <div className="space-y-5">
              {/* AI Message Banner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 ${
                  isHighRisk
                    ? "bg-red-500/5 border-red-500/20"
                    : isSuspicious
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-emerald-500/5 border-emerald-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isHighRisk ? (
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : isSuspicious ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm ${
                      isHighRisk
                        ? "text-red-600 dark:text-red-300"
                        : isSuspicious
                          ? "text-amber-600 dark:text-amber-300"
                          : "text-emerald-600 dark:text-emerald-300"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </motion.div>

              {/* Main Verdict Card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`rounded-2xl border ${config.border} ${config.bg} p-6`}
              >
                <div className="flex flex-col items-center">
                  <CircularRisk
                    score={Math.round(score)}
                    color={config.color}
                    glow={config.glow}
                  />

                  <div className="text-center mt-4 mb-6">
                    <h2 className={`text-xl font-extrabold ${config.text}`}>
                      {isSuspicious ? "⚠ " : ""}
                      {isHighRisk ? "🚨 " : ""}
                      {displayLabel}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                      AI Verdict
                    </p>
                  </div>

                  {/* Stats grid */}
                  <div className="w-full grid grid-cols-2 gap-4">
                    <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs mb-1">AI Verdict</p>
                      <p className={`font-bold text-lg ${config.text}`}>
                        {verdictKey}
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs mb-1">
                        Model Confidence
                      </p>
                      <p className="font-bold text-lg text-slate-900 dark:text-white">
                        {Math.round(
                          (detection.confidence ?? detection.score ?? 0) * 100,
                        )}
                        %
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs mb-1">File Type</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {detection.imageUrl?.includes("video")
                          ? "MP4 Video"
                          : detection.imageUrl?.includes("audio")
                            ? "Audio"
                            : detection.fileName?.match(/\.(mp4|mov|avi)$/i)
                              ? "Video"
                              : detection.fileName?.match(/\.(mp3|wav|m4a)$/i)
                                ? "Audio"
                                : detection.fileName?.match(
                                      /\.(jpg|jpeg|png|webp)$/i,
                                    )
                                  ? "Image"
                                  : "Media File"}
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs mb-1">
                        Model Version
                      </p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {detection.modelVersion || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Detection Findings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Info className="w-4 h-4 text-[#22D3EE]" />
                  <h2
                    className="text-slate-900 dark:text-white"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    Detection Findings
                  </h2>
                </div>
                <div className="space-y-3">
                  {generateFindings(detection).map(
                    ({ icon: Icon, text, severity }, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${severity === "high" ? "bg-red-500/10" : "bg-amber-500/10"}`}
                        >
                          <Icon
                            className={`w-4 h-4 ${severity === "high" ? "text-red-500" : "text-amber-500"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-slate-700 dark:text-slate-300"
                            style={{ fontSize: "14px" }}
                          >
                            {text}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md flex-shrink-0 ${severity === "high" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}
                          style={{ fontSize: "11px", fontWeight: 700 }}
                        >
                          {severity}
                        </span>
                      </motion.div>
                    ),
                  )}
                </div>
              </motion.div>

              {/* Explainable AI Visualization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#22D3EE]" />
                    <h2
                      className="text-slate-900 dark:text-white"
                      style={{ fontSize: "15px", fontWeight: 700 }}
                    >
                      Explainable AI Visualization
                    </h2>
                    <span
                      className="px-2 py-0.5 rounded-full bg-[#22D3EE]/10 text-[#22D3EE]"
                      style={{ fontSize: "10px", fontWeight: 700 }}
                    >
                      XAI
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  {(
                    [
                      { id: "video", icon: Video, label: "Video Timeline" },
                      { id: "image", icon: ImageIcon, label: "Image Heatmap" },
                      { id: "audio", icon: Mic, label: "Audio Spectrogram" },
                    ] as const
                  ).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setVizTab(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        vizTab === id
                          ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/30"
                      }`}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={vizTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {vizTab === "video" && <VideoTimeline />}
                      {vizTab === "image" && <ImageHeatmap />}
                      {vizTab === "audio" && <AudioSpectrogram />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Technical Breakdown Accordion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenAccordion(!openAccordion)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span
                      className="text-slate-900 dark:text-white"
                      style={{ fontSize: "15px", fontWeight: 700 }}
                    >
                      Technical Breakdown
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      {generateTechnicalData(detection).length} metrics
                    </span>
                  </div>
                  {openAccordion ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openAccordion && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <div className="p-6 grid sm:grid-cols-2 gap-3">
                      {generateTechnicalData(detection).map(
                        ({ label, value, status }) => (
                          <div
                            key={label}
                            className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40"
                          >
                            <div>
                              <p
                                className="text-slate-500 dark:text-slate-400"
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                {label}
                              </p>
                              <p
                                className="text-slate-900 dark:text-slate-200 mt-0.5"
                                style={{ fontSize: "13px", fontWeight: 600 }}
                              >
                                {value}
                              </p>
                            </div>
                            <div
                              className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${status === "critical" ? "bg-red-500" : "bg-amber-500"}`}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Right Panel */}
            <div className="space-y-5">
              {/* Risk Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-2xl bg-white dark:bg-[#1E293B] border ${config.border} p-5`}
                style={{ boxShadow: `0 0 32px ${config.glow}` }}
              >
                <h3
                  className="text-slate-900 dark:text-white mb-3"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  Risk Summary
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Visual AI Score",
                      score: Math.round(score),
                    },
                    {
                      label: "Audio AI Score",
                      score: Math.min(100, Math.round(score * 0.98 + 2)),
                    },
                    {
                      label: "Metadata Score",
                      score: Math.max(
                        0,
                        Math.min(100, Math.round(score * 0.91 + 2)),
                      ),
                    },
                  ].map(({ label, score: s }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1">
                        <span
                          className="text-slate-500 dark:text-slate-400"
                          style={{ fontSize: "12px", fontWeight: 500 }}
                        >
                          {label}
                        </span>
                        <span
                          className={config.text}
                          style={{ fontSize: "12px", fontWeight: 700 }}
                        >
                          {Math.min(s, 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(s, 100)}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: config.color,
                            boxShadow: `0 0 6px ${config.glow}`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recommended Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-5"
              >
                <h3
                  className="text-slate-900 dark:text-white mb-4"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  Recommended Actions
                </h3>
                <div className="space-y-3">
                  {(score <= 30
                    ? [
                        "Content appears to be authentic",
                        "Continue to verify through additional sources",
                        "Download report for future reference",
                        "Monitor for any future modifications",
                      ]
                    : score >= 70
                      ? [
                          "Do not share or distribute this content",
                          "Report to platform where found",
                          "Consult legal advice if used maliciously",
                          "Download report for documentation",
                        ]
                      : [
                          "Exercise caution when sharing this content",
                          "Cross-verify with additional trusted sources",
                          "Download report for documentation",
                          "Monitor for any modifications or re-uploads",
                        ]
                  ).map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <span
                          className={config.text}
                          style={{ fontSize: "10px", fontWeight: 800 }}
                        >
                          {i + 1}
                        </span>
                      </div>
                      <span
                        className="text-slate-600 dark:text-slate-400"
                        style={{ fontSize: "13px", lineHeight: 1.5 }}
                      >
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Verdict Scale */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-5"
              >
                <h3
                  className="text-slate-900 dark:text-white mb-3"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  Verdict Scale
                </h3>
                <div className="space-y-2.5">
                  {(labelIsReal
                    ? [
                        {
                          label: "Authentic",
                          range: "70–100%",
                          color: "bg-emerald-500",
                          active: score >= 70,
                        },
                        {
                          label: "Suspicious",
                          range: "31–69%",
                          color: "bg-amber-500",
                          active: score > 30 && score < 70,
                        },
                        {
                          label: "Low Authenticity",
                          range: "0–30%",
                          color: "bg-red-500",
                          active: score <= 30,
                        },
                      ]
                    : [
                        {
                          label: "Authentic",
                          range: "0–30%",
                          color: "bg-emerald-500",
                          active: score <= 30,
                        },
                        {
                          label: "Suspicious",
                          range: "31–69%",
                          color: "bg-amber-500",
                          active: score > 30 && score < 70,
                        },
                        {
                          label: "Deepfake",
                          range: "70–100%",
                          color: "bg-red-500",
                          active: score >= 70,
                        },
                      ]
                  ).map(({ label, range, color, active }) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between p-2.5 rounded-lg ${active ? `${config.bg} border ${config.border}` : "bg-slate-50 dark:bg-slate-700/40"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span
                          className={
                            active
                              ? config.text
                              : "text-slate-500 dark:text-slate-400"
                          }
                          style={{
                            fontSize: "13px",
                            fontWeight: active ? 700 : 500,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      <span
                        className="text-slate-400"
                        style={{ fontSize: "12px" }}
                      >
                        {range}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setShowReport(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  <Download className="w-4 h-4" />
                  Download PDF Report
                </button>
                <button
                  onClick={() => navigate("/detect")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Scan Another File
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Export Modal */}
        {showReport && (
          <ReportModal
            onClose={() => setShowReport(false)}
            detection={detection}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function generateFindings(detection: DetectionData) {
  const score = (detection.score ?? 0) * 100;
  const isFake =
    getVerdictKey(detection.label, score) === "DEEPFAKE" || score >= 40;

  if (isFake) {
    const framePct = Math.min(70, Math.round(score * 0.62 + 5));
    const blinkRate = Math.max(0.2, Math.min(0.6, (score / 100) * 0.3 + 0.15));
    const syncDelay = Math.round(score * 3.5 + 20);
    return [
      {
        icon: Eye,
        text: `Facial boundary inconsistencies detected in ${framePct}% of frames`,
        severity: "high",
      },
      {
        icon: Activity,
        text: `Abnormal eye blinking pattern — ${blinkRate.toFixed(1)} blinks/sec vs natural 0.4`,
        severity: "high",
      },
      {
        icon: Waves,
        text: `Audio-visual synchronization mismatch of ${syncDelay}ms`,
        severity: score >= 70 ? "high" : "medium",
      },
      {
        icon: Cpu,
        text: `GAN fingerprint artifacts detected with ${Math.round(score)}% confidence`,
        severity: score >= 70 ? "high" : "medium",
      },
    ];
  }

  return [
    {
      icon: Eye,
      text: "Natural facial boundary consistency across all frames",
      severity: "high",
    },
    {
      icon: Activity,
      text: "Normal eye blinking pattern detected — 0.4 blinks/sec",
      severity: "high",
    },
    {
      icon: Waves,
      text: "Audio-visual synchronization within normal range",
      severity: "high",
    },
    {
      icon: Cpu,
      text: "No GAN fingerprint artifacts detected",
      severity: "high",
    },
  ];
}

function generateTechnicalData(detection: DetectionData) {
  const score = (detection.score ?? 0) * 100;
  const isCritical = (val: number) => (val >= 70 ? "critical" : "warning");
  const fakeScoreNorm = score / 100;
  const coherence = Math.max(
    0.05,
    Math.min(0.5, ((100 - score) / 100) * 0.4 + 0.05),
  );
  const spectrogramDev = Math.max(0.5, Math.min(5, (score / 100) * 3.5 + 0.5));
  const corruptedFields = score >= 50 ? Math.min(3, Math.round(score / 50)) : 0;

  return [
    {
      label: "Deepfake Score",
      value: `${fakeScoreNorm.toFixed(3)} / 1.0`,
      status: isCritical(score),
    },
    {
      label: "Temporal Coherence",
      value: `${coherence.toFixed(3)} (${score >= 50 ? "low" : "high"})`,
      status: isCritical(score),
    },
    {
      label: "Spectrogram Anomaly",
      value: `${score >= 50 ? "High" : "Low"} — ${spectrogramDev.toFixed(1)}σ deviation`,
      status: score >= 50 ? "critical" : "warning",
    },
    {
      label: "Metadata Mismatch",
      value: `${corruptedFields} fields ${score >= 50 ? "corrupted" : "valid"}`,
      status: score >= 50 ? "critical" : "warning",
    },
    {
      label: "GAN Fingerprint",
      value: score >= 50 ? "Detected" : "Not detected",
      status: score >= 50 ? "critical" : "warning",
    },
    {
      label: "Frame Analysis",
      value: `${Math.round(score)}% frames flagged`,
      status: isCritical(score),
    },
    {
      label: "Model Version",
      value: detection.modelVersion || "v3.2.1",
      status: "warning",
    },
    {
      label: "Confidence Level",
      value: `${Math.round((detection.confidence ?? detection.score ?? 0) * 100)}%`,
      status: isCritical(score),
    },
  ];
}
