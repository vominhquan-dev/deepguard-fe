import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardLayout } from "../components/DashboardLayout";
import { toast } from "sonner";
import {
  Monitor,
  Camera,
  Mic,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Eye,
  Cpu,
  Waves,
  Volume2,
  VolumeX,
  Square,
  Clock,
  Zap,
  Info,
  Shield,
  X,
  Play,
  Radio,
  TrendingUp,
  Brain,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type ScanMode = "idle" | "screen" | "camera" | "microphone";

interface IndicatorData {
  key: string;
  label: string;
  icon: React.ElementType;
  value: number;
  active: boolean;
  color: string;
}

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

// ── Helpers ────────────────────────────────────────────────────────────────
const INITIAL_INDICATORS: IndicatorData[] = [
  {
    key: "face",
    label: "Face Mismatch",
    icon: Eye,
    value: 0,
    active: false,
    color: "#EF4444",
  },
  {
    key: "lip",
    label: "Lip-Sync Anomaly",
    icon: Waves,
    value: 0,
    active: false,
    color: "#F59E0B",
  },
  {
    key: "eye",
    label: "Eye Blinking Irregularity",
    icon: Activity,
    value: 0,
    active: false,
    color: "#8B5CF6",
  },
  {
    key: "voice",
    label: "Voice Frequency Artifacts",
    icon: Mic,
    value: 0,
    active: false,
    color: "#22D3EE",
  },
  {
    key: "gan",
    label: "GAN Artifact Detection",
    icon: Cpu,
    value: 0,
    active: false,
    color: "#EC4899",
  },
];

const WEIGHTS = [0.3, 0.2, 0.15, 0.2, 0.15];
const WAVEFORM_BARS = 48;

function fmt(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Simulated Canvas Feed ──────────────────────────────────────────────────
function SimulatedFeed({
  mode,
  riskScore,
}: {
  mode: ScanMode;
  riskScore: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode === "idle" || mode === "microphone") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const drawCamera = (f: number) => {
      // Background
      ctx.fillStyle = "#080e1a";
      ctx.fillRect(0, 0, W, H);

      // Subtle room gradient
      const bg = ctx.createRadialGradient(
        W / 2,
        H * 0.4,
        10,
        W / 2,
        H * 0.4,
        W * 0.6,
      );
      bg.addColorStop(0, "rgba(25, 40, 75, 0.7)");
      bg.addColorStop(1, "rgba(5, 8, 18, 0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Head bob
      const bob = Math.sin(f / 45) * 4;
      const cx = W / 2;
      const cy = H * 0.36 + bob;
      const rx = W * 0.13;
      const ry = H * 0.2;

      // Shoulders
      const sg = ctx.createLinearGradient(
        cx - W * 0.32,
        cy + ry,
        cx + W * 0.32,
        cy + ry + H * 0.22,
      );
      sg.addColorStop(0, "#182033");
      sg.addColorStop(0.5, "#2a3a5c");
      sg.addColorStop(1, "#182033");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(cx, cy + ry + H * 0.14, W * 0.32, H * 0.17, 0, 0, Math.PI);
      ctx.fill();

      // Neck
      ctx.fillStyle = "#2a3555";
      ctx.fillRect(cx - rx * 0.22, cy + ry * 0.82, rx * 0.44, H * 0.09);

      // Head
      const hg = ctx.createRadialGradient(
        cx - rx * 0.2,
        cy - ry * 0.2,
        rx * 0.1,
        cx,
        cy,
        rx * 1.2,
      );
      hg.addColorStop(0, "#3d5080");
      hg.addColorStop(1, "#1e2d4a");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blink logic
      const blink = f % 210 < 10;
      if (!blink) {
        // Eyes
        [cx - rx * 0.38, cx + rx * 0.38].forEach((ex) => {
          ctx.fillStyle = "#0a0f1a";
          ctx.beginPath();
          ctx.ellipse(
            ex,
            cy - ry * 0.08,
            rx * 0.14,
            ry * 0.09,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          // Iris
          const iris = ctx.createRadialGradient(
            ex,
            cy - ry * 0.08,
            0,
            ex,
            cy - ry * 0.08,
            rx * 0.08,
          );
          iris.addColorStop(0, "#5aa0ff");
          iris.addColorStop(1, "#2255bb");
          ctx.fillStyle = iris;
          ctx.beginPath();
          ctx.ellipse(
            ex,
            cy - ry * 0.08,
            rx * 0.08,
            ry * 0.06,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          // Pupil
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.ellipse(
            ex,
            cy - ry * 0.08,
            rx * 0.04,
            ry * 0.032,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        });
      }

      // Nose
      ctx.strokeStyle = "rgba(80,110,160,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - ry * 0.05);
      ctx.lineTo(cx - rx * 0.1, cy + ry * 0.22);
      ctx.lineTo(cx + rx * 0.1, cy + ry * 0.22);
      ctx.stroke();

      // Mouth (slight smile)
      ctx.strokeStyle = "rgba(80,110,160,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy + ry * 0.38, rx * 0.22, 0.15, Math.PI - 0.15);
      ctx.stroke();

      // Ear left
      ctx.fillStyle = "#1e2d4a";
      ctx.beginPath();
      ctx.ellipse(cx - rx, cy, rx * 0.13, ry * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ear right
      ctx.beginPath();
      ctx.ellipse(cx + rx, cy, rx * 0.13, ry * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vignette
      const vig = ctx.createRadialGradient(
        W / 2,
        H / 2,
        H * 0.25,
        W / 2,
        H / 2,
        H * 0.75,
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // High-risk red tint overlay
      if (riskScore > 65) {
        const alpha = (riskScore - 65) / 100;
        ctx.fillStyle = `rgba(239,68,68,${alpha * 0.12})`;
        ctx.fillRect(0, 0, W, H);
      }
    };

    const drawScreen = (f: number) => {
      // Desktop background
      ctx.fillStyle = "#1a1f2e";
      ctx.fillRect(0, 0, W, H);

      // Wallpaper gradient
      const wp = ctx.createLinearGradient(0, 0, W, H);
      wp.addColorStop(0, "#0f1624");
      wp.addColorStop(1, "#1a2540");
      ctx.fillStyle = wp;
      ctx.fillRect(0, 0, W, H);

      // Grid overlay (subtle)
      ctx.strokeStyle = "rgba(34,211,238,0.04)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Video-call window
      const vx = W * 0.06,
        vy = H * 0.06,
        vw = W * 0.88,
        vh = H * 0.74;
      roundRect(ctx, vx, vy, vw, vh, 10);
      ctx.fillStyle = "#0c1220";
      ctx.fill();
      ctx.strokeStyle = "rgba(34,211,238,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Window title bar
      ctx.fillStyle = "#111927";
      roundRect(ctx, vx, vy, vw, 24, 10);
      ctx.fill();
      ctx.fillStyle = "rgba(34,211,238,0.5)";
      ctx.font = "9px Inter, sans-serif";
      ctx.fillText("● LIVE VIDEO CALL  —  DeepGuard Monitor", vx + 12, vy + 15);

      // Main participant area
      const pcx = vx + vw / 2;
      const pcy = vy + 24 + (vh - 24) * 0.42;

      // Participant head
      ctx.fillStyle = "#232d45";
      ctx.beginPath();
      ctx.arc(pcx, pcy, W * 0.09, 0, Math.PI * 2);
      ctx.fill();

      // Participant shoulders
      ctx.fillStyle = "#1a2438";
      ctx.beginPath();
      ctx.ellipse(pcx, pcy + W * 0.11, W * 0.22, H * 0.12, 0, 0, Math.PI);
      ctx.fill();

      // Eyes
      const blink = f % 180 < 10;
      if (!blink) {
        [pcx - W * 0.035, pcx + W * 0.035].forEach((ex) => {
          ctx.fillStyle = "#3a7aff";
          ctx.beginPath();
          ctx.ellipse(
            ex,
            pcy - W * 0.01,
            W * 0.012,
            H * 0.012,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        });
      }

      // Small self-view pip
      const sx = vx + vw - 110,
        sy = vy + 30,
        sw = 100,
        sh = 70;
      roundRect(ctx, sx, sy, sw, sh, 6);
      ctx.fillStyle = "#0f1826";
      ctx.fill();
      ctx.strokeStyle = "rgba(34,211,238,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // tiny face in pip
      ctx.fillStyle = "#2a3555";
      ctx.beginPath();
      ctx.arc(sx + sw / 2, sy + sh * 0.4, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e2a40";
      ctx.beginPath();
      ctx.ellipse(sx + sw / 2, sy + sh * 0.75, 24, 12, 0, 0, Math.PI);
      ctx.fill();

      // Scanning animation bar across face
      const scanY = pcy - W * 0.09 + ((f % 120) / 120) * W * 0.18;
      const scanGrad = ctx.createLinearGradient(
        pcx - W * 0.1,
        scanY,
        pcx + W * 0.1,
        scanY,
      );
      scanGrad.addColorStop(0, "rgba(34,211,238,0)");
      scanGrad.addColorStop(0.5, "rgba(34,211,238,0.4)");
      scanGrad.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(pcx - W * 0.1, scanY, W * 0.2, 2);

      // Bottom controls bar
      ctx.fillStyle = "#0d1320";
      ctx.fillRect(vx, vy + vh - 50, vw, 50);

      // Control icons (mic mute, camera, hang up, chat)
      const controls = ["#22c55e", "#3b82f6", "#ef4444", "#8b5cf6"];
      controls.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(pcx + (i - 1.5) * 44, vy + vh - 25, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          ["🎤", "📷", "✕", "💬"][i],
          pcx + (i - 1.5) * 44,
          vy + vh - 21,
        );
        ctx.textAlign = "left";
      });

      // Taskbar
      ctx.fillStyle = "#0a1020";
      ctx.fillRect(0, H * 0.88, W, H * 0.12);

      // Taskbar items (fake icons)
      ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b"].forEach((c, i) => {
        ctx.fillStyle = c;
        roundRect(ctx, 12 + i * 36, H * 0.91, 26, 22, 4);
        ctx.fill();
      });

      // Clock in taskbar
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      ctx.fillStyle = "rgba(150,180,220,0.7)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(timeStr, W - 10, H * 0.97);
      ctx.textAlign = "left";

      // Risk overlay
      if (riskScore > 65) {
        const alpha = (riskScore - 65) / 100;
        ctx.fillStyle = `rgba(239,68,68,${alpha * 0.1})`;
        ctx.fillRect(0, 0, W, H);
      }
    };

    const tick = () => {
      frameRef.current++;
      if (mode === "camera") drawCamera(frameRef.current);
      else if (mode === "screen") drawScreen(frameRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode, riskScore]);

  if (mode === "idle" || mode === "microphone") return null;
  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="w-full h-full object-cover"
    />
  );
}

// ── Waveform Bars ──────────────────────────────────────────────────────────
function WaveformViz({
  active,
  anomalous,
}: {
  active: boolean;
  anomalous: boolean;
}) {
  const [bars, setBars] = useState<number[]>(Array(WAVEFORM_BARS).fill(8));

  useEffect(() => {
    if (!active) {
      setBars(Array(WAVEFORM_BARS).fill(8));
      return;
    }
    const id = setInterval(() => {
      setBars(
        Array(WAVEFORM_BARS)
          .fill(0)
          .map((_, i) => {
            const base = anomalous
              ? Math.random() * 80 + 20
              : Math.random() * 48 + 8;
            const wave = Math.sin(Date.now() / 400 + i * 0.4) * 12;
            return Math.max(4, Math.min(96, base + wave));
          }),
      );
    }, 80);
    return () => clearInterval(id);
  }, [active, anomalous]);

  return (
    <div className="flex items-center justify-center gap-[2px] w-full h-full">
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-full flex-shrink-0 transition-all duration-75"
          style={{
            width: "3px",
            height: `${h}%`,
            background: anomalous
              ? `rgba(239,68,68,${0.5 + h / 200})`
              : `rgba(34,211,238,${0.4 + h / 200})`,
            boxShadow: anomalous
              ? h > 60
                ? "0 0 6px rgba(239,68,68,0.6)"
                : "none"
              : h > 70
                ? "0 0 4px rgba(34,211,238,0.5)"
                : "none",
          }}
        />
      ))}
    </div>
  );
}

// ── Video Overlay (bounding box, heatmap, landmarks) ──────────────────────
function VideoOverlay({
  riskScore,
  mode,
}: {
  riskScore: number;
  mode: ScanMode;
}) {
  const boxColor =
    riskScore > 70 ? "#EF4444" : riskScore > 40 ? "#F59E0B" : "#22D3EE";
  const high = riskScore > 55;

  return (
    <>
      {/* Sweep scan line */}
      <div className="scan-line" />

      {/* Corner brackets */}
      {[
        { pos: "top-2 left-2", bt: 2, bb: 0, bl: 2, br: 0 },
        { pos: "top-2 right-2", bt: 2, bb: 0, bl: 0, br: 2 },
        { pos: "bottom-2 left-2", bt: 0, bb: 2, bl: 2, br: 0 },
        { pos: "bottom-2 right-2", bt: 0, bb: 2, bl: 0, br: 2 },
      ].map(({ pos, bt, bb, bl, br }, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-5 h-5`}
          style={{
            borderColor: "#22D3EE",
            borderTopWidth: bt,
            borderBottomWidth: bb,
            borderLeftWidth: bl,
            borderRightWidth: br,
          }}
        />
      ))}

      {/* Drifting bounding box + heatmap */}
      <div
        className="heatmap-blob absolute"
        style={{ top: "11%", left: "29%", width: "42%", height: "54%" }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <rect
            x="1"
            y="1"
            width="98"
            height="98"
            fill="none"
            stroke={boxColor}
            strokeWidth="1.5"
            strokeDasharray="10 4"
            className="bbox-dash"
            opacity="0.85"
          />
        </svg>
        <div
          className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-white"
          style={{
            fontSize: "9px",
            fontWeight: 700,
            backgroundColor: boxColor,
            letterSpacing: "0.05em",
          }}
        >
          {riskScore > 70
            ? "DEEPFAKE"
            : riskScore > 40
              ? "SUSPICIOUS"
              : "ANALYZING"}
        </div>
        {high && (
          <div
            className="absolute inset-0 rounded"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.07) 55%, transparent 75%)",
              mixBlendMode: "screen",
            }}
          />
        )}
      </div>

      {/* Facial landmark dots */}
      {high &&
        [
          { x: "38%", y: "28%" },
          { x: "58%", y: "28%" },
          { x: "48%", y: "46%" },
          { x: "40%", y: "60%" },
          { x: "58%", y: "60%" },
        ].map((d, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: d.x,
              top: d.y,
              backgroundColor: boxColor,
              boxShadow: `0 0 6px ${boxColor}`,
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8 + i * 0.1, repeat: Infinity }}
          />
        ))}

      {/* LIVE label */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/55 backdrop-blur-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 live-beacon" />
        <span
          className="text-white"
          style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }}
        >
          {mode === "screen" ? "SCREEN" : "CAMERA"} • LIVE
        </span>
      </div>
    </>
  );
}

// ── Source Picker Modal ────────────────────────────────────────────────────
function SourcePickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (src: string) => void;
  onClose: () => void;
}) {
  const sources = [
    {
      id: "screen",
      icon: Monitor,
      label: "Entire Screen",
      desc: "Monitor your full desktop for deepfake threats",
    },
    {
      id: "window",
      icon: Brain,
      label: "Application Window",
      desc: "Scan a specific app like a video call window",
    },
    {
      id: "tab",
      icon: Radio,
      label: "Browser Tab",
      desc: "Monitor a browser tab for online deepfake content",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-[#2563EB] dark:text-[#22D3EE]" />
            </div>
            <div>
              <p
                className="text-slate-900 dark:text-white"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                Select Capture Source
              </p>
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "11px" }}
              >
                Choose what to monitor for deepfake content
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          {sources.map(({ id, icon: Icon, label, desc }) => (
            <motion.button
              key={id}
              whileHover={{ x: 3 }}
              onClick={() => onSelect(id)}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-left border border-slate-200 dark:border-slate-700 hover:border-[#2563EB]/40 dark:hover:border-[#22D3EE]/40 hover:bg-[#2563EB]/5 dark:hover:bg-[#22D3EE]/5 transition-all duration-150 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2563EB]/10 dark:group-hover:bg-[#22D3EE]/10 transition-colors">
                <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#2563EB] dark:group-hover:text-[#22D3EE]" />
              </div>
              <div>
                <p
                  className="text-slate-900 dark:text-white"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  {label}
                </p>
                <p
                  className="text-slate-500 dark:text-slate-400 mt-0.5"
                  style={{ fontSize: "11px" }}
                >
                  {desc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-[#0F172A]/60 border-t border-slate-200 dark:border-slate-700">
          <p
            className="text-slate-400 dark:text-slate-500 text-center"
            style={{ fontSize: "11px" }}
          >
            Demo mode — simulated deepfake analysis will begin immediately.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export function RealtimeMonitor() {
  const [mode, setMode] = useState<ScanMode>("idle");
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [displayRisk, setDisplayRisk] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [indicators, setIndicators] =
    useState<IndicatorData[]>(INITIAL_INDICATORS);
  const [alertShown, setAlertShown] = useState(false);
  const [alertTime, setAlertTime] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [protectionMode, setProtectionMode] = useState(false);
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [warmup, setWarmup] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indicRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRiskRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warmupRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logIdRef = useRef(1);
  const loggedThresholds = useRef<Set<number>>(new Set());
  const loggedIndicators = useRef<Set<string>>(new Set());
  const elapsedRef = useRef(0); // always up-to-date for log timestamps

  // ── Log helper ────────────────────────────────────────────────────────
  const addLog = useCallback((msg: string, sev: LogEntry["severity"]) => {
    setActivityLog((prev) =>
      [
        {
          id: logIdRef.current++,
          timestamp: fmt(elapsedRef.current),
          message: msg,
          severity: sev,
        },
        ...prev,
      ].slice(0, 30),
    );
  }, []);

  // ── Full stop ─────────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (indicRef.current) clearInterval(indicRef.current);
    if (animRiskRef.current) clearInterval(animRiskRef.current);
    if (warmupRef.current) clearTimeout(warmupRef.current);
    setIsMonitoring(false);
    setRiskScore(0);
    setDisplayRisk(0);
    setConfidence(0);
    setAnomalyCount(0);
    setAlertShown(false);
    setElapsed(0);
    setWarmup(true);
    setIndicators(INITIAL_INDICATORS);
    loggedThresholds.current.clear();
    loggedIndicators.current.clear();
    elapsedRef.current = 0;
  }, []);

  const handleStop = useCallback(() => {
    stopAll();
    setMode("idle");
    setActivityLog([]);
    toast.success("Monitoring session ended.");
  }, [stopAll]);

  // ── Begin simulated monitoring ────────────────────────────────────────
  const beginMonitoring = useCallback(
    (newMode: ScanMode) => {
      stopAll();
      setMode(newMode);
      setIsMonitoring(true);
      setActivityLog([]);
      loggedThresholds.current.clear();
      loggedIndicators.current.clear();
      logIdRef.current = 1;
      elapsedRef.current = 0;

      warmupRef.current = setTimeout(() => {
        setWarmup(false);

        // Session timer
        timerRef.current = setInterval(() => {
          setElapsed((p) => {
            elapsedRef.current = p + 1;
            return p + 1;
          });
        }, 1000);

        let tick = 0;
        indicRef.current = setInterval(() => {
          tick++;
          setIndicators((prev) => {
            const updated = prev.map((ind, idx) => {
              let val: number;
              const micBoost =
                newMode === "microphone" && (idx === 1 || idx === 3) ? 18 : 0;
              if (tick < 4) {
                val = Math.random() * 22 + micBoost * 0.4;
              } else {
                if (ind.active) {
                  val = ind.value + (Math.random() - 0.44) * 24;
                  if (Math.random() < 0.1) val = Math.random() * 20;
                } else {
                  val = ind.value + (Math.random() - 0.58) * 16 + micBoost;
                  if (Math.random() < 0.18) val = 42 + Math.random() * 54;
                }
              }
              val = Math.max(0, Math.min(100, val));
              return { ...ind, value: Math.round(val), active: val > 48 };
            });

            const risk = Math.round(
              updated.reduce((a, ind, i) => a + ind.value * WEIGHTS[i], 0),
            );
            setRiskScore(risk);
            setAnomalyCount(updated.filter((i) => i.active).length);
            setConfidence(
              Math.min(98, 52 + tick * 3 + Math.floor(Math.random() * 7)),
            );
            return updated;
          });
        }, 1500);
      }, 2500);
    },
    [stopAll],
  );

  // ── Animate risk display ──────────────────────────────────────────────
  useEffect(() => {
    if (animRiskRef.current) clearInterval(animRiskRef.current);
    const diff = riskScore - displayRisk;
    if (diff === 0) return;
    const step = diff > 0 ? 1 : -1;
    animRiskRef.current = setInterval(() => {
      setDisplayRisk((prev) => {
        if (
          (step > 0 && prev >= riskScore) ||
          (step < 0 && prev <= riskScore)
        ) {
          clearInterval(animRiskRef.current!);
          return riskScore;
        }
        return prev + step;
      });
    }, 18);
    return () => {
      if (animRiskRef.current) clearInterval(animRiskRef.current);
    };
  }, [riskScore]); // eslint-disable-line

  // ── Event logging ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMonitoring || warmup) return;

    indicators.forEach((ind) => {
      if (ind.active && !loggedIndicators.current.has(ind.key)) {
        loggedIndicators.current.add(ind.key);
        addLog(
          `${ind.label} detected (${ind.value}%)`,
          ind.value > 70 ? "critical" : "warning",
        );
      } else if (!ind.active) {
        loggedIndicators.current.delete(ind.key);
      }
    });

    [30, 55, 72, 88].forEach((t) => {
      if (riskScore >= t && !loggedThresholds.current.has(t)) {
        loggedThresholds.current.add(t);
        addLog(
          `Risk score increased to ${riskScore}%`,
          t >= 72 ? "critical" : "warning",
        );
      }
    });

    if (riskScore > 70 && !alertShown) {
      setAlertShown(true);
      setAlertTime(fmt(elapsedRef.current));
      addLog("⚠ Potential deepfake alert triggered", "critical");
    }
    if (riskScore < 60 && alertShown) setAlertShown(false);
  }, [indicators, riskScore, isMonitoring, warmup, alertShown, addLog]);

  // ── Unmount cleanup ───────────────────────────────────────────────────
  useEffect(() => () => stopAll(), [stopAll]);

  // ── Start handlers ────────────────────────────────────────────────────
  const startCamera = () => {
    beginMonitoring("camera");
    toast.success("Camera monitoring started — demo mode.");
  };

  const startMicrophone = () => {
    beginMonitoring("microphone");
    toast.success("Microphone monitoring started — demo mode.");
  };

  const handleSourceSelect = (src: string) => {
    setShowSourcePicker(false);
    beginMonitoring("screen");
    const label =
      src === "tab"
        ? "Browser Tab"
        : src === "window"
          ? "App Window"
          : "Entire Screen";
    toast.success(`Screen monitoring started — ${label} (demo mode).`);
  };

  // ── Derived ───────────────────────────────────────────────────────────
  const riskColor =
    displayRisk >= 70 ? "#EF4444" : displayRisk >= 40 ? "#F59E0B" : "#10B981";
  const riskLabel =
    displayRisk >= 70
      ? "HIGH RISK"
      : displayRisk >= 40
        ? "SUSPICIOUS"
        : displayRisk > 0
          ? "LOW RISK"
          : "ANALYZING";
  const isVideoMode = mode === "screen" || mode === "camera";
  const isAudioMode = mode === "microphone";

  return (
    <DashboardLayout>
      <div
        className="p-6 lg:p-8 min-h-full"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Radio className="w-4 h-4 text-red-500" />
              </div>
              <h1
                className="text-slate-900 dark:text-white"
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Realtime Deepfake Monitor
              </h1>
              {isMonitoring && !warmup && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  <div className="w-2 h-2 rounded-full bg-red-500 live-beacon" />
                  <span
                    className="text-red-500"
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                    }}
                  >
                    LIVE
                  </span>
                </div>
              )}
            </div>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "14px" }}
            >
              Analyze live video calls and screen content to detect potential
              deepfake threats.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={soundEnabled ? "Mute alerts" : "Enable sound"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#2563EB] dark:text-[#22D3EE]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span
                className="text-slate-600 dark:text-slate-300 hidden sm:block"
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {soundEnabled ? "Sound On" : "Muted"}
              </span>
            </button>

            {mode !== "idle" && (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <Square className="w-3.5 h-3.5" />
                Stop Monitoring
              </button>
            )}
          </div>
        </div>

        {/* ── Safety Notice ─────────────────────────────────────────── */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 mb-5">
          <Info className="w-4 h-4 text-[#2563EB] dark:text-[#22D3EE] flex-shrink-0 mt-0.5" />
          <p
            className="text-slate-600 dark:text-slate-400"
            style={{ fontSize: "12px", lineHeight: 1.6 }}
          >
            <span
              className="text-slate-900 dark:text-slate-200"
              style={{ fontWeight: 600 }}
            >
              Privacy First:{" "}
            </span>
            Realtime monitoring only analyzes visual patterns and does not
            record your screen. All processing happens locally — no data leaves
            your device.
          </p>
        </div>

        {/* ── Protection Mode Toggle ────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${protectionMode ? "bg-[#22D3EE]/10 protection-active" : "bg-slate-100 dark:bg-slate-800"}`}
            >
              <Shield
                className={`w-4 h-4 ${protectionMode ? "text-[#22D3EE]" : "text-slate-400"}`}
              />
            </div>
            <div>
              <p
                className="text-slate-900 dark:text-white"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Realtime Protection Mode
              </p>
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "11px" }}
              >
                {protectionMode
                  ? "Active — continuously monitoring for deepfake patterns"
                  : "Enable to auto-alert on suspicious deepfake patterns"}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setProtectionMode((v) => {
                toast(
                  v ? "Protection Mode disabled" : "🛡 Protection Mode enabled",
                );
                return !v;
              })
            }
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${protectionMode ? "bg-[#22D3EE]" : "bg-slate-300 dark:bg-slate-700"}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${protectionMode ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </div>

        {/* ── Alert Banner ──────────────────────────────────────────── */}
        <AnimatePresence>
          {alertShown && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="alert-pulse mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className="text-red-500"
                    style={{ fontSize: "14px", fontWeight: 800 }}
                  >
                    ⚠ Potential Deepfake Detected
                  </p>
                  <div className="w-2 h-2 rounded-full bg-red-500 live-beacon" />
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                    <span
                      className="text-red-400"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Risk Score:{" "}
                      <span className="text-red-500">{displayRisk}%</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    <span
                      className="text-red-400"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Detected at:{" "}
                      <span className="text-red-500">{alertTime}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-red-400" />
                    <span
                      className="text-red-400"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Region:{" "}
                      <span className="text-red-500">
                        Facial area (center frame)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAlertShown(false)}
                className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── IDLE: mode selector ───────────────────────────────────── */}
        {mode === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className="text-slate-500 dark:text-slate-400 mb-4"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Choose Monitoring Mode
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {/* Screen */}
              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowSourcePicker(true);
                }}
                className="card-hover flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-[#2563EB]/40 dark:hover:border-[#22D3EE]/40 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center group-hover:bg-[#2563EB]/20 transition-colors">
                  <Monitor className="w-7 h-7 text-[#2563EB] dark:text-[#22D3EE]" />
                </div>
                <div className="text-center">
                  <p
                    className="text-slate-900 dark:text-white mb-1"
                    style={{ fontSize: "15px", fontWeight: 700 }}
                  >
                    Start Screen Scan
                  </p>
                  <p
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "12px", lineHeight: 1.5 }}
                  >
                    Monitor your screen, window, or browser tab in real-time
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] group-hover:bg-[#1d4ed8] transition-colors btn-glow-blue">
                  <Play className="w-3 h-3 text-white" />
                  <span
                    className="text-white"
                    style={{ fontSize: "12px", fontWeight: 700 }}
                  >
                    Start
                  </span>
                </div>
              </motion.button>

              {/* Camera */}
              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={startCamera}
                className="card-hover flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-[#22D3EE]/40 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#22D3EE]/10 flex items-center justify-center group-hover:bg-[#22D3EE]/20 transition-colors">
                  <Camera className="w-7 h-7 text-[#22D3EE]" />
                </div>
                <div className="text-center">
                  <p
                    className="text-slate-900 dark:text-white mb-1"
                    style={{ fontSize: "15px", fontWeight: 700 }}
                  >
                    Start Camera Scan
                  </p>
                  <p
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "12px", lineHeight: 1.5 }}
                  >
                    Analyze your live camera feed for face manipulation
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/30 group-hover:bg-[#22D3EE]/20 transition-colors">
                  <Play className="w-3 h-3 text-[#22D3EE]" />
                  <span
                    className="text-[#22D3EE]"
                    style={{ fontSize: "12px", fontWeight: 700 }}
                  >
                    Start
                  </span>
                </div>
              </motion.button>

              {/* Microphone */}
              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={startMicrophone}
                className="card-hover flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-[#8B5CF6]/40 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center group-hover:bg-[#8B5CF6]/20 transition-colors">
                  <Mic className="w-7 h-7 text-[#8B5CF6]" />
                </div>
                <div className="text-center">
                  <p
                    className="text-slate-900 dark:text-white mb-1"
                    style={{ fontSize: "15px", fontWeight: 700 }}
                  >
                    Start Microphone Scan
                  </p>
                  <p
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "12px", lineHeight: 1.5 }}
                  >
                    Detect voice cloning and AI-generated speech artifacts
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 group-hover:bg-[#8B5CF6]/20 transition-colors">
                  <Play className="w-3 h-3 text-[#8B5CF6]" />
                  <span
                    className="text-[#8B5CF6]"
                    style={{ fontSize: "12px", fontWeight: 700 }}
                  >
                    Start
                  </span>
                </div>
              </motion.button>
            </div>

            {/* Feature hints */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  icon: Zap,
                  label: "Sub-second latency",
                  desc: "Near-instant AI inference pipeline",
                  color: "#F59E0B",
                },
                {
                  icon: Brain,
                  label: "5 AI models active",
                  desc: "Face, lip, eye, voice & GAN detectors",
                  color: "#8B5CF6",
                },
                {
                  icon: ShieldCheck,
                  label: "Zero data retention",
                  desc: "Nothing leaves your device",
                  color: "#10B981",
                },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div>
                    <p
                      className="text-slate-900 dark:text-slate-200"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      {label}
                    </p>
                    <p className="text-slate-500" style={{ fontSize: "11px" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── ACTIVE: monitoring interface ──────────────────────────── */}
        {mode !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-5 gap-6"
          >
            {/* ── Left column: preview + log ─────────────────────────── */}
            <div className="lg:col-span-3 space-y-4">
              {/* Preview box */}
              <div
                className="rounded-2xl bg-[#0C1220] border border-slate-700/60 overflow-hidden relative"
                style={{ aspectRatio: isAudioMode ? "16/7" : "16/9" }}
              >
                {/* Warmup overlay */}
                {warmup && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0C1220]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-10 h-10 rounded-full border-2 border-[#22D3EE]/20 border-t-[#22D3EE] mb-4"
                    />
                    <p
                      className="text-[#22D3EE]"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      Initializing AI Models...
                    </p>
                    <p
                      className="text-slate-500 mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      Setting up {isAudioMode ? "audio" : "video"} analysis
                      pipeline
                    </p>
                  </div>
                )}

                {/* Canvas simulation (screen / camera) */}
                {isVideoMode && (
                  <>
                    <SimulatedFeed mode={mode} riskScore={displayRisk} />
                    {!warmup && (
                      <VideoOverlay riskScore={displayRisk} mode={mode} />
                    )}
                  </>
                )}

                {/* Microphone waveform */}
                {isAudioMode && !warmup && (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="scan-line" />
                    <div className="flex-1 flex items-center px-6">
                      <WaveformViz active={true} anomalous={displayRisk > 55} />
                    </div>

                    {/* Anomaly region */}
                    {displayRisk > 50 && (
                      <div
                        className="absolute"
                        style={{
                          left: "32%",
                          top: "15%",
                          width: "22%",
                          height: "70%",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          borderRadius: "4px",
                        }}
                      >
                        <span
                          className="absolute -top-4 left-0 text-red-400"
                          style={{ fontSize: "9px", fontWeight: 700 }}
                        >
                          ANOMALY
                        </span>
                      </div>
                    )}

                    {/* Corner brackets */}
                    {[
                      { pos: "top-2 left-2", bt: 2, bb: 0, bl: 2, br: 0 },
                      { pos: "top-2 right-2", bt: 2, bb: 0, bl: 0, br: 2 },
                      { pos: "bottom-2 left-2", bt: 0, bb: 2, bl: 2, br: 0 },
                      { pos: "bottom-2 right-2", bt: 0, bb: 2, bl: 0, br: 2 },
                    ].map(({ pos, bt, bb, bl, br }, i) => (
                      <div
                        key={i}
                        className={`absolute ${pos} w-4 h-4`}
                        style={{
                          borderColor: "#8B5CF6",
                          borderTopWidth: bt,
                          borderBottomWidth: bb,
                          borderLeftWidth: bl,
                          borderRightWidth: br,
                        }}
                      />
                    ))}

                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] live-beacon" />
                      <span
                        className="text-white"
                        style={{ fontSize: "10px", fontWeight: 700 }}
                      >
                        MIC • LIVE
                      </span>
                    </div>
                  </div>
                )}

                {/* Warmup waveform bg */}
                {warmup && isAudioMode && (
                  <div className="absolute inset-0 flex items-center px-6 opacity-20">
                    <WaveformViz active={false} anomalous={false} />
                  </div>
                )}
              </div>

              {/* Session timer */}
              {!warmup && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      Session Duration
                    </span>
                  </div>
                  <span
                    className="text-slate-900 dark:text-[#22D3EE]"
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmt(elapsed)}
                  </span>
                </div>
              )}

              {/* Activity Log */}
              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span
                    className="text-slate-900 dark:text-white"
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    Live Activity Log
                  </span>
                  {activityLog.length > 0 && (
                    <span
                      className="ml-auto px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "10px", fontWeight: 600 }}
                    >
                      {activityLog.length} events
                    </span>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto p-2 space-y-1">
                  <AnimatePresence initial={false}>
                    {activityLog.length === 0 ? (
                      <div
                        className="flex items-center justify-center py-8 text-slate-400 dark:text-slate-600"
                        style={{ fontSize: "12px" }}
                      >
                        {warmup
                          ? "Waiting for analysis to start..."
                          : "Monitoring — no events yet"}
                      </div>
                    ) : (
                      activityLog.map((e) => (
                        <motion.div
                          key={e.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-start gap-3 px-3 py-2 rounded-lg ${
                            e.severity === "critical"
                              ? "bg-red-500/8 dark:bg-red-500/10"
                              : e.severity === "warning"
                                ? "bg-amber-500/8 dark:bg-amber-500/10"
                                : "bg-slate-50 dark:bg-slate-800/40"
                          }`}
                        >
                          <span
                            className="flex-shrink-0 mt-0.5"
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              fontVariantNumeric: "tabular-nums",
                              color: "#6B7280",
                            }}
                          >
                            {e.timestamp}
                          </span>
                          <span
                            className={`flex-1 ${
                              e.severity === "critical"
                                ? "text-red-500"
                                : e.severity === "warning"
                                  ? "text-amber-500"
                                  : "text-slate-600 dark:text-slate-400"
                            }`}
                            style={{ fontSize: "11px", fontWeight: 500 }}
                          >
                            → {e.message}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ── Right column: AI status + indicators ──────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {/* Risk card */}
              <div
                className={`p-5 rounded-2xl border ${alertShown ? "bg-red-500/8 border-red-500/25" : "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700"}`}
              >
                <p
                  className="text-slate-500 dark:text-slate-400 mb-4"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  AI Status
                </p>

                <div className="flex items-center gap-5 mb-4">
                  {/* Circular risk gauge */}
                  <div
                    className="relative w-20 h-20 flex-shrink-0"
                    style={{
                      filter:
                        displayRisk > 70
                          ? "drop-shadow(0 0 10px rgba(239,68,68,0.4))"
                          : "none",
                    }}
                  >
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 80 80"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke={riskColor}
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - displayRisk / 100)}`}
                        strokeLinecap="round"
                        style={{
                          transition:
                            "stroke-dashoffset 0.3s ease, stroke 0.5s ease",
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: 900,
                          color: riskColor,
                          letterSpacing: "-1px",
                          lineHeight: 1,
                        }}
                      >
                        {displayRisk}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: riskColor,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {warmup ? "STARTING..." : riskLabel}
                      </span>
                      {!warmup && (
                        <div
                          className="w-1.5 h-1.5 rounded-full live-beacon"
                          style={{ backgroundColor: riskColor }}
                        />
                      )}
                    </div>

                    {[
                      {
                        label: "Confidence",
                        val: warmup ? 0 : confidence,
                        color: "#2563EB",
                        show: warmup ? "--" : `${confidence}%`,
                      },
                      {
                        label: "Risk Score",
                        val: warmup ? 0 : displayRisk,
                        color: riskColor,
                        show: warmup ? "--" : `${displayRisk}%`,
                      },
                    ].map(({ label, val, color, show }) => (
                      <div key={label} className="mb-1.5">
                        <div className="flex justify-between mb-0.5">
                          <span
                            className="text-slate-400"
                            style={{ fontSize: "10px" }}
                          >
                            {label}
                          </span>
                          <span
                            style={{ fontSize: "10px", fontWeight: 600, color }}
                          >
                            {show}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${val}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <AlertTriangle
                    className={`w-3.5 h-3.5 flex-shrink-0 ${anomalyCount > 2 ? "text-red-500" : anomalyCount > 0 ? "text-amber-500" : "text-slate-400"}`}
                  />
                  <span
                    className="text-slate-600 dark:text-slate-400"
                    style={{ fontSize: "11px" }}
                  >
                    {warmup
                      ? "Scanning..."
                      : `${anomalyCount} active anomal${anomalyCount === 1 ? "y" : "ies"} detected`}
                  </span>
                </div>
              </div>

              {/* Indicators */}
              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p
                    className="text-slate-900 dark:text-white"
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    Detection Indicators
                  </p>
                  <p className="text-slate-400" style={{ fontSize: "10px" }}>
                    Updates every 1.5 seconds
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  {indicators.map((ind) => {
                    const Icon = ind.icon;
                    return (
                      <div
                        key={ind.key}
                        className={`p-3 rounded-xl transition-all duration-300 ${ind.active ? "bg-slate-50 dark:bg-slate-800/60" : "bg-slate-50/50 dark:bg-slate-800/20"}`}
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: ind.active
                                ? `${ind.color}20`
                                : "transparent",
                              border: `1px solid ${ind.active ? ind.color + "40" : "transparent"}`,
                            }}
                          >
                            <Icon
                              className="w-3.5 h-3.5"
                              style={{
                                color: ind.active ? ind.color : "#94A3B8",
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`truncate ${ind.active ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-500"}`}
                                style={{ fontSize: "11px", fontWeight: 600 }}
                              >
                                {ind.label}
                              </p>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span
                                  className={ind.active ? "indicator-live" : ""}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: ind.active ? ind.color : "#6B7280",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {warmup ? "--" : `${ind.value}%`}
                                </span>
                                {ind.active && (
                                  <span
                                    className="px-1 py-0.5 rounded text-white"
                                    style={{
                                      fontSize: "8px",
                                      fontWeight: 800,
                                      backgroundColor: ind.color,
                                      letterSpacing: "0.05em",
                                    }}
                                  >
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: ind.active
                                ? ind.color
                                : "#64748B",
                            }}
                            animate={{ width: warmup ? "0%" : `${ind.value}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick stats */}
              {!warmup && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Frames/sec",
                      value: isAudioMode ? "N/A" : "30 fps",
                      icon: Activity,
                      color: "#22D3EE",
                    },
                    {
                      label: "Models active",
                      value: "5 / 5",
                      icon: Cpu,
                      color: "#8B5CF6",
                    },
                    {
                      label: "Latency",
                      value: "~38ms",
                      icon: Zap,
                      color: "#F59E0B",
                    },
                    {
                      label: "Status",
                      value: "Scanning",
                      icon: ShieldCheck,
                      color: "#10B981",
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div>
                        <p
                          className="text-slate-400"
                          style={{
                            fontSize: "9px",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-slate-900 dark:text-slate-200"
                          style={{ fontSize: "11px", fontWeight: 700 }}
                        >
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Source picker modal */}
      <AnimatePresence>
        {showSourcePicker && (
          <SourcePickerModal
            onSelect={handleSourceSelect}
            onClose={() => setShowSourcePicker(false)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
