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
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { toast } from "sonner";

const RISK_SCORE = 87;
const CONFIDENCE = 92;

const verdictConfig = {
  Deepfake: {
    color: "#EF4444",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-500",
    glow: "rgba(239,68,68,0.4)",
  },
  Suspicious: {
    color: "#F59E0B",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-500",
    glow: "rgba(245,158,11,0.4)",
  },
  Authentic: {
    color: "#10B981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    glow: "rgba(16,185,129,0.4)",
  },
};

const findings = [
  {
    icon: Eye,
    text: "Facial boundary inconsistencies detected in 34% of frames",
    severity: "high",
  },
  {
    icon: Activity,
    text: "Abnormal eye blinking pattern — 0.2 blinks/sec vs natural 0.4",
    severity: "high",
  },
  {
    icon: Waves,
    text: "Audio-visual synchronization mismatch of 180ms",
    severity: "medium",
  },
  {
    icon: Cpu,
    text: "GAN fingerprint artifacts detected in DCT frequency domain",
    severity: "high",
  },
];

const technicalData = [
  {
    label: "Frame Inconsistency Score",
    value: "0.847 / 1.0",
    status: "critical",
  },
  { label: "Temporal Coherence", value: "0.213 (low)", status: "critical" },
  {
    label: "Spectrogram Anomaly",
    value: "High — 4.2σ deviation",
    status: "warning",
  },
  {
    label: "Metadata Mismatch",
    value: "3 fields corrupted",
    status: "warning",
  },
  {
    label: "GAN Fingerprint",
    value: "Detected (StyleGAN2)",
    status: "critical",
  },
  {
    label: "Compression Artifacts",
    value: "Inconsistent patterns",
    status: "warning",
  },
  {
    label: "Facial Landmark Drift",
    value: "12.4px avg displacement",
    status: "critical",
  },
  {
    label: "Audio Spectral Entropy",
    value: "2.84 bits (anomalous)",
    status: "warning",
  },
];

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
            {/* Tooltip */}
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
                "linear-gradient(90deg, rgba(239,68,68,0.2), rgba(239,68,68,0.9))",
            }}
          />
          <span
            className="text-slate-500 dark:text-slate-400"
            style={{ fontSize: "11px" }}
          >
            Suspicion intensity
          </span>
        </div>
      </div>

      {/* Heatmap container */}
      <div
        className="relative rounded-xl overflow-hidden bg-slate-800"
        style={{ height: "220px" }}
      >
        {/* Dark face-like silhouette placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-32 h-40 rounded-full bg-slate-700 opacity-60"
            style={{ borderRadius: "50% 50% 45% 45%" }}
          />
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Heat regions */}
        {heatRegions.map((r, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="absolute cursor-pointer rounded-lg transition-all duration-200"
            style={{
              top: r.top,
              left: r.left,
              width: r.w,
              height: r.h,
              background: `rgba(239,68,68,${r.opacity})`,
              boxShadow: `0 0 12px rgba(239,68,68,${r.opacity * 0.6})`,
              transform: hovered === i ? "scale(1.05)" : "scale(1)",
            }}
          >
            {hovered === i && (
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white whitespace-nowrap z-10"
                style={{ fontSize: "10px", fontWeight: 600 }}
              >
                {r.label}
              </div>
            )}
          </div>
        ))}

        {/* Corner scan markers */}
        {[
          "top-2 left-2",
          "top-2 right-2",
          "bottom-2 left-2",
          "bottom-2 right-2",
        ].map((pos) => (
          <div
            key={pos}
            className={`absolute ${pos} w-4 h-4 border-[#22D3EE]/50`}
            style={{ borderWidth: "2px 0 0 2px" }}
          />
        ))}
        {(["top-2 right-2"] as const).map((pos) => (
          <div
            key={pos + "2"}
            className={`absolute top-2 right-2 w-4 h-4 border-[#22D3EE]/50`}
            style={{ borderWidth: "2px 2px 0 0" }}
          />
        ))}
      </div>
      <p className="text-slate-400 mt-3" style={{ fontSize: "11px" }}>
        ⚠ 5 suspicious regions identified · GAN boundary artifacts prominent ·
        Hover to inspect areas
      </p>
    </div>
  );
}

// ── Audio Spectrogram Visualization ──
const spectrogramBars = Array.from({ length: 60 }, (_, i) => {
  const isAnomaly = [8, 9, 10, 22, 23, 24, 35, 36, 37, 50, 51, 52].includes(i);
  const height = isAnomaly ? 60 + Math.random() * 35 : 20 + Math.random() * 40;
  return { height, isAnomaly };
});

function AudioSpectrogram() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span
            className="text-slate-500 dark:text-slate-400"
            style={{ fontSize: "11px" }}
          >
            Anomaly cluster
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#2563EB]/60" />
          <span
            className="text-slate-500 dark:text-slate-400"
            style={{ fontSize: "11px" }}
          >
            Normal frequency
          </span>
        </div>
      </div>

      {/* Frequency labels */}
      <div className="flex justify-between mb-1">
        {["20Hz", "200Hz", "1kHz", "4kHz", "16kHz"].map((f) => (
          <span key={f} className="text-slate-400" style={{ fontSize: "9px" }}>
            {f}
          </span>
        ))}
      </div>

      {/* Spectrogram */}
      <div
        className="relative rounded-xl bg-slate-900 dark:bg-[#0F172A] p-4 overflow-hidden"
        style={{ height: "140px" }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "100% 25%, calc(100%/5) 100%",
          }}
        />

        {/* Bars */}
        <div className="flex items-end gap-0.5 h-full">
          {spectrogramBars.map((bar, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${bar.height}%` }}
              transition={{ duration: 0.4, delay: i * 0.008 }}
              className="flex-1 rounded-t-sm"
              style={{
                backgroundColor: bar.isAnomaly
                  ? `rgba(239,68,68,${0.7 + Math.random() * 0.3})`
                  : `rgba(37,99,235,${0.3 + Math.random() * 0.4})`,
                boxShadow: bar.isAnomaly
                  ? "0 0 6px rgba(239,68,68,0.5)"
                  : "none",
              }}
            />
          ))}
        </div>

        {/* Anomaly region labels */}
        {[
          { left: "13%", label: "Clone artifact" },
          { left: "37%", label: "Phase mismatch" },
          { left: "60%", label: "Spectral gap" },
          { left: "84%", label: "Entropy spike" },
        ].map(({ left, label }) => (
          <div key={label} className="absolute top-1" style={{ left }}>
            <div className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40">
              <span
                className="text-red-400"
                style={{ fontSize: "8px", fontWeight: 700 }}
              >
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-slate-400 mt-3" style={{ fontSize: "11px" }}>
        ⚠ 4 spectral anomaly clusters · 2.84-bit entropy (expected: 4.1+) · AI
        voice synthesis detected
      </p>
    </div>
  );
}

// ── Report Export Modal ──
const VERIFICATION_ID = "DGA-2026-X7K2-M9P4-QR81";
const FILE_HASH =
  "a3f8c2e91b4d76f052c8a19e3d45b7f2c6e91a48d2e3c7b9f1a2d4e8c5b9a7f3";
const SCAN_TIMESTAMP = "March 4, 2026 at 14:37:22 UTC";
const AI_MODELS = [
  "FaceForensics++ v3.2",
  "GAN Fingerprinter v1.8",
  "AudioSynthDet v2.1",
  "TemporalCoherence AI",
  "DCT Analyzer Pro",
  "MetaValidator 4.0",
  "EnsembleVerdict v5",
];

interface ReportModalProps {
  onClose: () => void;
  config: (typeof verdictConfig)["Deepfake"];
}

function ReportModal({ onClose, config }: ReportModalProps) {
  const copyId = () => {
    navigator.clipboard.writeText(VERIFICATION_ID);
    toast.success("Verification ID copied to clipboard");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 shadow-2xl"
        >
          {/* Report header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0F172A] border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p
                  className="text-white"
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "-0.2px",
                  }}
                >
                  DeepGuard AI — Official Report
                </p>
                <p className="text-slate-400" style={{ fontSize: "10px" }}>
                  CONFIDENTIAL · Do not distribute
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toast.success("Report sent to printer.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Verification metadata */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <p
                    className="text-slate-500 dark:text-slate-400"
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Verification ID
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code
                    className="text-[#22D3EE] flex-1"
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      wordBreak: "break-all",
                    }}
                  >
                    {VERIFICATION_ID}
                  </code>
                  <button
                    onClick={copyId}
                    className="text-slate-400 hover:text-slate-200 flex-shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <p
                    className="text-slate-500 dark:text-slate-400"
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Scan Timestamp
                  </p>
                </div>
                <p
                  className="text-slate-900 dark:text-slate-200"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  {SCAN_TIMESTAMP}
                </p>
              </div>
            </div>

            {/* File info + hash */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p
                className="text-slate-500 dark:text-slate-400 mb-3"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                File Information
              </p>
              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                {[
                  { label: "File Name", value: "interview_clip.mp4" },
                  { label: "File Size", value: "48.2 MB" },
                  { label: "Format", value: "MP4 · H.264 · 1080p" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p
                      className="text-slate-400"
                      style={{ fontSize: "10px", fontWeight: 600 }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-slate-900 dark:text-slate-200"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <p
                  className="text-slate-400 mb-1"
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  SHA-256 File Hash
                </p>
                <code
                  className="text-slate-500 dark:text-slate-500 break-all"
                  style={{ fontSize: "10px" }}
                >
                  {FILE_HASH}
                </code>
              </div>
            </div>

            {/* Risk score summary */}
            <div className="flex items-center gap-5 p-5 rounded-xl border-2 border-red-500/25 bg-red-500/5">
              <div>
                <div
                  style={{
                    fontSize: "52px",
                    fontWeight: 900,
                    color: "#EF4444",
                    lineHeight: 1,
                    letterSpacing: "-2px",
                  }}
                >
                  {RISK_SCORE}%
                </div>
                <div
                  className="text-red-400"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Risk Score
                </div>
              </div>
              <div className="h-16 w-px bg-red-500/20" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30">
                    <span
                      className="text-red-500"
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                      }}
                    >
                      DEEPFAKE
                    </span>
                  </div>
                  <span
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "12px" }}
                  >
                    AI Verdict
                  </span>
                </div>
                <p
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "12px" }}
                >
                  Model Confidence:{" "}
                  <strong className="text-slate-900 dark:text-slate-200">
                    {CONFIDENCE}%
                  </strong>
                </p>
                <p
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "12px" }}
                >
                  Models Used:{" "}
                  <strong className="text-slate-900 dark:text-slate-200">
                    7 AI Models
                  </strong>
                </p>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p
                className="text-slate-900 dark:text-white mb-3"
                style={{ fontSize: "13px", fontWeight: 700 }}
              >
                AI Explanation Summary
              </p>
              <div className="space-y-2">
                {findings.map(({ icon: Icon, text, severity }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${severity === "high" ? "bg-red-500" : "bg-amber-500"}`}
                    />
                    <p
                      className="text-slate-600 dark:text-slate-400"
                      style={{ fontSize: "12px", lineHeight: 1.5 }}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Models used */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p
                className="text-slate-500 dark:text-slate-400 mb-3"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Detection Models
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_MODELS.map((m) => (
                  <span
                    key={m}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                    style={{ fontSize: "11px", fontWeight: 500 }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Digital signature */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-[#22D3EE]/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-[#22D3EE]" />
                <p
                  className="text-[#22D3EE]"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Digital Signature
                </p>
              </div>
              <code
                className="text-slate-400 break-all"
                style={{ fontSize: "9px", lineHeight: 1.6 }}
              >
                -----BEGIN DEEPGUARD SIGNATURE-----{"\n"}
                MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2s8{VERIFICATION_ID}
                xK9{"\n"}
                mJ4pL7nQ2vR5wT8yU3zA6bC9dE1fG0hH4iI7jK5lM2nN8oO6pP3qQ9rR1sS0t
                {"\n"}
                -----END DEEPGUARD SIGNATURE-----
              </code>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span
                  className="text-emerald-400"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  Report integrity verified · DeepGuard CA Root · v2.0
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-slate-400" style={{ fontSize: "11px" }}>
                This report was generated automatically by DeepGuard AI. For
                legal use, verify the Verification ID at deepguard.ai/verify.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Results Component ──
type VizTab = "video" | "image" | "audio";

export function Results() {
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [vizTab, setVizTab] = useState<VizTab>("video");
  const verdict = "Deepfake";
  const config = verdictConfig[verdict];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full bg-red-500" />
              <h1
                className="text-slate-900 dark:text-white"
                style={{
                  fontSize: "24px",
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
              Analysis complete for{" "}
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                interview_clip.mp4
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/detect")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              <RefreshCw className="w-4 h-4" />
              Scan Another
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main result column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Verdict + Risk Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-red-500/10 border-b border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span
                  className="text-red-600 dark:text-red-400"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  High confidence deepfake detected. Do not share or trust this
                  content.
                </span>
              </div>

              <div className="p-6">
                {/* Media preview */}
                <div
                  className="relative rounded-xl overflow-hidden bg-slate-900 dark:bg-[#0F172A] mb-6"
                  style={{ height: "180px" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "13px" }}
                      >
                        interview_clip.mp4 · 2:34 · 1080p
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="px-2.5 py-1 rounded-md bg-red-500/20 border border-red-500/40 backdrop-blur-sm">
                      <span
                        className="text-red-400"
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        ⚠ DEEPFAKE DETECTED
                      </span>
                    </div>
                  </div>
                  {[20, 45, 68, 82].map((pct) => (
                    <div
                      key={pct}
                      className="absolute top-0 bottom-0 w-px bg-red-400/50"
                      style={{ left: `${pct}%` }}
                    >
                      <div className="absolute top-2 left-1 w-1.5 h-1.5 rounded-full bg-red-400" />
                    </div>
                  ))}
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-900">
                    <div className="h-1 bg-slate-700 mx-3 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-red-400 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Verdict + Score */}
                <div className="grid sm:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <CircularRisk
                      score={RISK_SCORE}
                      color={config.color}
                      glow={config.glow}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p
                        className="text-slate-400 dark:text-slate-500 mb-2"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        AI Verdict
                      </p>
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} border ${config.border}`}
                      >
                        <AlertTriangle className={`w-4 h-4 ${config.text}`} />
                        <span
                          className={config.text}
                          style={{
                            fontSize: "18px",
                            fontWeight: 800,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {verdict.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span
                          className="text-slate-400 dark:text-slate-500"
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        >
                          Model Confidence
                        </span>
                        <span
                          className="text-slate-900 dark:text-white"
                          style={{ fontSize: "12px", fontWeight: 700 }}
                        >
                          {CONFIDENCE}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${CONFIDENCE}%` }}
                          transition={{
                            duration: 1.2,
                            delay: 0.5,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "File Type", value: "MP4 Video" },
                        { label: "Duration", value: "2 min 34s" },
                        { label: "Frames Scanned", value: "3,840" },
                        { label: "Models Used", value: "7 AI Models" },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                        >
                          <p
                            className="text-slate-400 dark:text-slate-500"
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-slate-900 dark:text-slate-200"
                            style={{ fontSize: "13px", fontWeight: 700 }}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Findings */}
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
                {findings.map(({ icon: Icon, text, severity }, i) => (
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
                ))}
              </div>
            </motion.div>

            {/* ── Explainable AI Visualization ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Header */}
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

              {/* Tab switcher */}
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

              {/* Visualization content */}
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
                    {technicalData.length} metrics
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
                    {technicalData.map(({ label, value, status }) => (
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
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Risk Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white dark:bg-[#1E293B] border border-red-500/20 p-5"
              style={{ boxShadow: "0 0 32px rgba(239,68,68,0.08)" }}
            >
              <h3
                className="text-slate-900 dark:text-white mb-3"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                Risk Summary
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Visual AI Score", score: 91 },
                  { label: "Audio AI Score", score: 78 },
                  { label: "Metadata Score", score: 82 },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: "12px", fontWeight: 500 }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-red-400"
                        style={{ fontSize: "12px", fontWeight: 700 }}
                      >
                        {score}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full bg-red-500"
                        style={{ boxShadow: "0 0 6px rgba(239,68,68,0.5)" }}
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
                {[
                  "Do not share or distribute this content",
                  "Report to platform where found",
                  "Consult legal advice if used maliciously",
                  "Download report for documentation",
                ].map((action, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span
                        className="text-red-500"
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
                {[
                  {
                    label: "Authentic",
                    range: "0–30%",
                    color: "bg-emerald-500",
                    active: false,
                  },
                  {
                    label: "Suspicious",
                    range: "31–69%",
                    color: "bg-amber-500",
                    active: false,
                  },
                  {
                    label: "Deepfake",
                    range: "70–100%",
                    color: "bg-red-500",
                    active: true,
                  },
                ].map(({ label, range, color, active }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between p-2.5 rounded-lg ${active ? "bg-red-500/10 border border-red-500/30" : "bg-slate-50 dark:bg-slate-700/40"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span
                        className={
                          active
                            ? "text-red-500"
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
        <ReportModal onClose={() => setShowReport(false)} config={config} />
      )}
    </DashboardLayout>
  );
}
