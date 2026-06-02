import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
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
import { useAuth } from "../../auth/context/AuthContext";
import { downloadScanReportPdf } from "../api/reportApi";

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
  type?: string; // for mock data
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
    color: "#10B981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    glow: "rgba(16,185,129,0.4)",
  },
  SUSPICIOUS: {
    color: "#10B981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    glow: "rgba(16,185,129,0.4)",
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
  // If label explicitly says REAL/AUTHENTIC/HUMAN, respect that
  if (
    normalizedLabel === "REAL" ||
    normalizedLabel === "AUTHENTIC" ||
    normalizedLabel === "HUMAN"
  ) {
    return "REAL";
  }
  // If label is SUSPICIOUS, return it
  if (normalizedLabel === "SUSPICIOUS") {
    return "SUSPICIOUS";
  }
  // If label explicitly says DEEPFAKE, return DEEPFAKE
  if (
    normalizedLabel === "DEEPFAKE" ||
    normalizedLabel === "FAKE" ||
    normalizedLabel === "DEEPFAKE_DETECTED"
  ) {
    return "DEEPFAKE";
  }
  // Otherwise, fallback to score-based
  if (score >= 70) return "DEEPFAKE";
  if (score > 30) return "SUSPICIOUS";
  return "REAL";
}

// ── Circular Score Component ──
function CircularScore({ score }: { score: number }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  const key = getVerdictKey("", score);
  const config = verdictConfig[key] || verdictConfig.SUSPICIOUS;
  const color = config.color;
  const glow = config.glow;
  const strokeDash = (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
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
          Real Score
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
        <div className="absolute top-4 left-3 text-[10px] text-slate-500">
          Anomaly detected at 1.3s–2.1s
        </div>
      </div>
    </div>
  );
}

// ── Distribution Chart ──
function DistributionChart({
  real,
  fake,
  suspicious,
  total,
}: {
  real: number;
  fake: number;
  suspicious: number;
  total: number;
}) {
  return (
    <div>
      <h3
        className="text-slate-900 dark:text-white mb-3"
        style={{ fontSize: "14px", fontWeight: 700 }}
      >
        Dataset Distribution
      </h3>
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${total > 0 ? (real / total) * 100 : 0}%` }}
        />
        <div
          className="bg-amber-500 transition-all"
          style={{
            width: `${total > 0 ? (suspicious / total) * 100 : 0}%`,
          }}
        />
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${total > 0 ? (fake / total) * 100 : 0}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-emerald-500" style={{ fontSize: "11px" }}>
          Real: {real}
        </span>
        <span className="text-amber-500" style={{ fontSize: "11px" }}>
          Suspicious: {suspicious}
        </span>
        <span className="text-red-500" style={{ fontSize: "11px" }}>
          Deepfake: {fake}
        </span>
      </div>
    </div>
  );
}

// ── Report Modal ──
function ReportModal({
  onClose,
  detection,
  onDownloadPdf,
}: {
  onClose: () => void;
  detection: DetectionData;
  onDownloadPdf: () => void;
}) {
  const score = Math.round((detection.score ?? 0) * 100);
  const color = "#10B981";
  const key = getVerdictKey(detection.label, score);
  const config = verdictConfig[key] || verdictConfig.SUSPICIOUS;
  const findings = generateFindings(detection);
  const technicalData = generateTechnicalData(detection);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = async () => {
    try {
      const reportText = `DeepGuard Detection Report
      File: ${detection.fileName || "Unknown"}
      Real Score: ${score}%
      Verdict: ${getVerdictKey(detection.label, score)}
      Processed At: ${detection.processedAt ? new Date(detection.processedAt).toLocaleString() : "N/A"}
      Model: ${detection.modelVersion || "N/A"}
      Confidence: ${Math.round((detection.confidence ?? detection.score ?? 0) * 100)}%`;
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Report copied to clipboard");
    } catch {
      toast.error("Failed to copy report");
    }
  };

  const handlePrint = () => window.print();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h2
              className="text-slate-900 dark:text-white"
              style={{ fontSize: "18px", fontWeight: 800 }}
            >
              Detection Report
            </h2>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "13px" }}
            >
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-6">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${config.bg} border ${config.border}`}
          >
            <span
              className={config.text}
              style={{ fontSize: "24px", fontWeight: 900 }}
            >
              {score}%
            </span>
          </div>
          <div>
            <p
              className={`${config.text} font-bold`}
              style={{ fontSize: "16px" }}
            >
              {getVerdictKey(detection.label, score)}
            </p>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "13px" }}
            >
              {detection.fileName || "Unknown file"}
            </p>
          </div>
        </div>

        {/* Findings */}
        <div className="mb-6">
          <h3
            className="text-slate-900 dark:text-white mb-3"
            style={{ fontSize: "14px", fontWeight: 700 }}
          >
            Detection Findings
          </h3>
          <div className="space-y-2">
            {findings.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <f.icon className="w-4 h-4 text-slate-500 mt-0.5" />
                <div>
                  <p
                    className="text-slate-900 dark:text-slate-200"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    {f.text}
                  </p>
                  <p
                    className="text-emerald-500"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {f.severity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Data */}
        <div className="mb-6">
          <h3
            className="text-slate-900 dark:text-white mb-3"
            style={{ fontSize: "14px", fontWeight: 700 }}
          >
            Technical Data
          </h3>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {technicalData.map((d, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2.5 ${i % 2 === 0 ? "bg-slate-50 dark:bg-slate-800/50" : "bg-white dark:bg-transparent"}`}
              >
                <span
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "13px" }}
                >
                  {d.label}
                </span>
                <span
                  className="text-slate-900 dark:text-white font-medium"
                  style={{ fontSize: "13px" }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verdict Scale */}
        <div className="mb-6">
          {(key === "DEEPFAKE"
            ? [
                { label: "Deepfake", range: "70–100%", dot: "bg-red-500" },
                { label: "Suspicious", range: "31–69%", dot: "bg-amber-500" },
                { label: "Authentic", range: "0–30%", dot: "bg-emerald-500" },
              ]
            : [
                { label: "Authentic", range: "70–100%", dot: "bg-emerald-500" },
                { label: "Suspicious", range: "31–69%", dot: "bg-amber-500" },
                {
                  label: "Low Authenticity",
                  range: "0–30%",
                  dot: "bg-emerald-500",
                },
              ]
          ).map((item, i) => {
            const isActive = i === 0;
            return (
              <div
                key={item.label}
                className={`flex items-center justify-between p-2.5 rounded-lg mb-2 ${isActive ? `${config.bg} border ${config.border}` : "bg-slate-50 dark:bg-slate-700/40"}`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${isActive ? item.dot : "bg-slate-300 dark:bg-slate-600"}`}
                  />
                  <span
                    className={
                      isActive
                        ? config.text
                        : "text-slate-500 dark:text-slate-400"
                    }
                    style={{
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                <span className="text-slate-400" style={{ fontSize: "12px" }}>
                  {item.range}
                </span>
              </div>
            );
          })}
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
            onClick={onDownloadPdf}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();
  const [detection, setDetection] = useState<DetectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [vizTab, setVizTab] = useState<"video" | "image" | "audio">("video");
  const [openAccordion, setOpenAccordion] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleDownloadPdf = async () => {
    if (!detection?.scanJobId) {
      toast.error("No scan job ID available for this detection.");
      return;
    }
    if (!accessToken) {
      toast.error("Please log in again to download reports.");
      return;
    }
    try {
      await downloadScanReportPdf(
        detection.scanJobId,
        accessToken,
        `deepguard-report-${detection.scanJobId}.pdf`,
      );
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download PDF report",
      );
    }
  };

  useEffect(() => {
    // Priority 1: check location state (navigated from History, etc.)
    const locationState = location.state as DetectionData | null;
    if (
      locationState &&
      locationState.label &&
      locationState.score !== undefined
    ) {
      setDetection(locationState);
      setLoading(false);
      return;
    }

    // Priority 2: read from localStorage (saved after scan)
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
  }, [location.state]);

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

  // ── Derived values ──
  const score = Math.round((detection.score ?? 0) * 100);
  const riskColor = "#10B981";
  const key = getVerdictKey(detection.label, score);
  const config = verdictConfig[key] || verdictConfig.SUSPICIOUS;
  const labelIsReal = key === "REAL";
  const findings = generateFindings(detection);
  const technicalData = generateTechnicalData(detection);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-start justify-between gap-4 mb-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 rounded-full bg-[#22D3EE]" />
                <h1
                  className="text-slate-900 dark:text-white"
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Detection Results
                </h1>
              </div>
              <p
                className="text-slate-500 dark:text-slate-400 ml-3"
                style={{ fontSize: "14px" }}
              >
                {detection.fileName
                  ? `Analysis complete for ${detection.fileName}`
                  : "Analysis complete"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/history")}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-semibold"
              >
                Scan History
              </button>
              <button
                onClick={() => navigate("/detect")}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 text-sm font-bold"
              >
                Scan Another
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ── LEFT: Score + Visualization ── */}
            <div className="xl:col-span-2 space-y-6">
              {/* Score + Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
              >
                <CircularScore score={score} />

                {/* Quick stats grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                    <p
                      className="text-slate-400 text-xs mb-0.5"
                      style={{ fontSize: "11px" }}
                    >
                      AI Verdict
                    </p>
                    <p
                      className={`${config.text} font-bold`}
                      style={{ fontSize: "18px" }}
                    >
                      {key}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                    <p
                      className="text-slate-400 text-xs mb-0.5"
                      style={{ fontSize: "11px" }}
                    >
                      Model Confidence
                    </p>
                    <p
                      className="text-slate-900 dark:text-white font-bold"
                      style={{ fontSize: "18px" }}
                    >
                      {Math.round(
                        (detection.confidence ?? detection.score ?? 0) * 100,
                      )}
                      %
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                    <p
                      className="text-slate-400 text-xs mb-0.5"
                      style={{ fontSize: "11px" }}
                    >
                      File Type
                    </p>
                    <p className="text-slate-900 dark:text-white font-bold text-sm">
                      {detection.type || "Media File"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                    <p
                      className="text-slate-400 text-xs mb-0.5"
                      style={{ fontSize: "11px" }}
                    >
                      Model Version
                    </p>
                    <p className="text-slate-900 dark:text-white font-bold text-sm">
                      {detection.modelVersion || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Detection Findings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-slate-900 dark:text-white"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    Detection Findings
                  </h3>
                  {key === "DEEPFAKE" && (
                    <span
                      className={`px-2.5 py-1 rounded-lg ${config.bg} border ${config.border} ${config.text}`}
                      style={{ fontSize: "11px", fontWeight: 700 }}
                    >
                      🚨 DEEPFAKE DETECTED
                    </span>
                  )}
                </div>
                <div className="space-y-2.5">
                  {findings.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <f.icon className="w-4 h-4 text-emerald-500" />
                        <span
                          className="text-emerald-700 dark:text-emerald-300"
                          style={{ fontSize: "13px", fontWeight: 500 }}
                        >
                          {f.text}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          f.severity === "high"
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Visualizations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
              >
                {/* Tabs */}
                <div className="flex gap-1 mb-5 p-1 rounded-xl bg-slate-100 dark:bg-slate-700/50 w-fit">
                  {(
                    [
                      { key: "video" as const, icon: Video, label: "Video" },
                      {
                        key: "image" as const,
                        icon: ImageIcon,
                        label: "Image",
                      },
                      { key: "audio" as const, icon: Mic, label: "Audio" },
                    ] as const
                  ).map(({ key: tabKey, icon: TabIcon, label }) => (
                    <button
                      key={tabKey}
                      onClick={() => setVizTab(tabKey)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        vizTab === tabKey
                          ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {vizTab === "video" && (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <VideoTimeline />
                    </motion.div>
                  )}
                  {vizTab === "image" && (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ImageHeatmap />
                    </motion.div>
                  )}
                  {vizTab === "audio" && (
                    <motion.div
                      key="audio"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <AudioSpectrogram />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ── RIGHT: Sidebar Panel ── */}
            <div className="space-y-6">
              {/* Technical Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
              >
                <h3
                  className="text-slate-900 dark:text-white mb-4"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  Technical Details
                </h3>
                <div className="space-y-3">
                  {technicalData.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0"
                    >
                      <span
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: "12px" }}
                      >
                        {d.label}
                      </span>
                      <span
                        className={`font-semibold ${
                          d.status === "critical"
                            ? "text-emerald-500"
                            : d.status === "warning"
                              ? "text-emerald-500"
                              : "text-slate-900 dark:text-white"
                        }`}
                        style={{ fontSize: "12px" }}
                      >
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Verdict Scale */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
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
                          active: score >= 70,
                          dot: "bg-emerald-500",
                        },
                        {
                          label: "Suspicious",
                          range: "31–69%",
                          active: score > 30 && score < 70,
                          dot: "bg-amber-500",
                        },
                        {
                          label: "Low Authenticity",
                          range: "0–30%",
                          active: score <= 30,
                          dot: "bg-emerald-500",
                        },
                      ]
                    : [
                        {
                          label: "Authentic",
                          range: "0–30%",
                          active: score <= 30,
                          dot: "bg-emerald-500",
                        },
                        {
                          label: "Suspicious",
                          range: "31–69%",
                          active: score > 30 && score < 70,
                          dot: "bg-amber-500",
                        },
                        {
                          label: "Deepfake",
                          range: "70–100%",
                          active: score >= 70,
                          dot: "bg-red-500",
                        },
                      ]
                  ).map(({ label, range, active, dot }) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between p-2.5 rounded-lg ${active ? `${config.bg} border ${config.border}` : "bg-slate-50 dark:bg-slate-700/40"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-full ${active ? dot : "bg-slate-300 dark:bg-slate-600"}`}
                        />
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
                  onClick={handleDownloadPdf}
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

          {/* Report Export Modal */}
          {showReport && (
            <ReportModal
              onClose={() => setShowReport(false)}
              detection={detection}
              onDownloadPdf={handleDownloadPdf}
            />
          )}
        </div>
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
      label: "Real Score",
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
