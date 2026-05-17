import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Mic,
  FileCheck,
  X,
  Cpu,
  Shield,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  AlertTriangle,
  WifiOff,
  Server,
  FileX,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";

type UploadState = "idle" | "selected" | "scanning" | "done" | "error";
type ErrorType =
  | "file_too_large"
  | "unsupported_format"
  | "analysis_failed"
  | "network_error"
  | "server_unavailable";

const errorConfigs: Record<
  ErrorType,
  {
    icon: React.ElementType;
    title: string;
    desc: string;
    hint: string;
    iconColor: string;
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  file_too_large: {
    icon: HardDrive,
    title: "File Too Large",
    desc: "The file you selected exceeds the 500MB limit. Please compress your file or use a shorter clip.",
    hint: "Tip: For videos, try reducing resolution to 1080p or trimming to under 2 minutes.",
    iconColor: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
  },
  unsupported_format: {
    icon: FileX,
    title: "Unsupported File Format",
    desc: "The file format is not supported. Please upload a valid image, video, or audio file.",
    hint: "Supported: JPG, PNG, WEBP, MP4, MOV, AVI, MP3, WAV, M4A",
    iconColor: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    badgeBg: "bg-red-500/10",
    badgeText: "text-red-600 dark:text-red-400",
  },
  analysis_failed: {
    icon: AlertTriangle,
    title: "AI Analysis Failed",
    desc: "Our detection models encountered an unexpected error while processing your file. This is usually temporary.",
    hint: "Try re-uploading the same file. If the error persists, contact support.",
    iconColor: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    badgeBg: "bg-red-500/10",
    badgeText: "text-red-600 dark:text-red-400",
  },
  network_error: {
    icon: WifiOff,
    title: "Network Error",
    desc: "Connection was interrupted during analysis. Please check your internet connection and try again.",
    hint: "Your file was not uploaded. No data was lost.",
    iconColor: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-400/25",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-600 dark:text-slate-400",
  },
  server_unavailable: {
    icon: Server,
    title: "Server Unavailable",
    desc: "Our servers are temporarily overloaded. We are automatically scaling capacity to handle the demand.",
    hint: "Average wait time: 2–3 minutes. Your position is being held.",
    iconColor: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/25",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-600 dark:text-purple-400",
  },
};

const recentScans = [
  {
    name: "interview_clip.mp4",
    type: "Video",
    verdict: "Deepfake",
    risk: 87,
    color: "text-red-400",
  },
  {
    name: "profile_photo.jpg",
    type: "Image",
    verdict: "Authentic",
    risk: 12,
    color: "text-emerald-400",
  },
  {
    name: "voice_msg.mp3",
    type: "Audio",
    verdict: "Suspicious",
    risk: 65,
    color: "text-amber-400",
  },
];

const demoErrors: { label: string; type: ErrorType; color: string }[] = [
  { label: "File Too Large", type: "file_too_large", color: "text-amber-500" },
  { label: "Bad Format", type: "unsupported_format", color: "text-red-500" },
  { label: "AI Failed", type: "analysis_failed", color: "text-red-400" },
  { label: "Network Error", type: "network_error", color: "text-slate-400" },
  {
    label: "Server Down",
    type: "server_unavailable",
    color: "text-purple-400",
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanPhases = [
    "Initializing AI models...",
    "Extracting media features...",
    "Analyzing with neural network...",
    "Running deepfake classifiers...",
    "Generating risk report...",
  ];

  const triggerError = (type: ErrorType) => {
    setErrorType(type);
    setUploadState("error");
    setSelectedFile(null);
  };

  const resetUpload = () => {
    setUploadState("idle");
    setSelectedFile(null);
    setProgress(0);
    setErrorType(null);
  };

  const startScan = useCallback(
    (file: File) => {
      setSelectedFile(file);
      setUploadState("scanning");
      setProgress(0);
      toast.info(`Analyzing ${file.name}...`, { duration: 2000 });

      let currentPhase = 0;
      setScanPhase(scanPhases[0]);

      const interval = setInterval(() => {
        setProgress((p) => {
          const next = p + 2;
          const phaseIdx = Math.floor((next / 100) * scanPhases.length);
          if (phaseIdx < scanPhases.length && phaseIdx !== currentPhase) {
            currentPhase = phaseIdx;
            setScanPhase(scanPhases[phaseIdx]);
          }
          if (next >= 100) {
            clearInterval(interval);
            setUploadState("done");
            setTimeout(() => {
              toast.success("Analysis complete! Redirecting to results...");
              setTimeout(() => navigate("/results"), 800);
            }, 300);
          }
          return Math.min(next, 100);
        });
      }, 60);
    },
    [navigate],
  );

  const handleFile = (file: File) => {
    // Validate file size (500MB)
    if (file.size > 500 * 1024 * 1024) {
      triggerError("file_too_large");
      toast.error("File exceeds the 500MB limit.");
      return;
    }
    // Validate file type
    const validTypes = ["image/", "video/", "audio/"];
    if (!validTypes.some((t) => file.type.startsWith(t))) {
      triggerError("unsupported_format");
      toast.error("Unsupported file format.");
      return;
    }
    setSelectedFile(file);
    setUploadState("selected");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const typeButtons = [
    {
      label: "Upload Image",
      icon: ImageIcon,
      accept: "image/*",
      ext: "JPG, PNG, WEBP",
    },
    {
      label: "Upload Video",
      icon: Video,
      accept: "video/*",
      ext: "MP4, MOV, AVI",
    },
    {
      label: "Upload Audio",
      icon: Mic,
      accept: "audio/*",
      ext: "MP3, WAV, M4A",
    },
  ];

  const currentError = errorType ? errorConfigs[errorType] : null;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
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
              Deepfake Detection
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            Upload media to analyze it with our AI detection engine
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* ── Error State ── */}
              {uploadState === "error" && currentError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className={`rounded-2xl bg-white dark:bg-[#1E293B] border ${currentError.border} p-8`}
                  style={{ boxShadow: "0 0 32px rgba(239,68,68,0.05)" }}
                >
                  {/* Error badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${currentError.badgeBg} mb-6`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${currentError.iconColor.replace("text-", "bg-")}`}
                    />
                    <span
                      className={`${currentError.badgeText}`}
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Error Detected
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl ${currentError.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <currentError.icon
                        className={`w-8 h-8 ${currentError.iconColor}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3
                        className="text-slate-900 dark:text-white mb-2"
                        style={{ fontSize: "18px", fontWeight: 700 }}
                      >
                        {currentError.title}
                      </h3>
                      <p
                        className="text-slate-500 dark:text-slate-400 mb-4"
                        style={{ fontSize: "14px", lineHeight: 1.6 }}
                      >
                        {currentError.desc}
                      </p>

                      {/* Hint box */}
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 mb-6">
                        <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p
                          className="text-slate-500 dark:text-slate-400"
                          style={{ fontSize: "12px", lineHeight: 1.5 }}
                        >
                          {currentError.hint}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={resetUpload}
                          className="btn-glow-blue flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                          style={{ fontSize: "14px", fontWeight: 700 }}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </button>
                        <button
                          onClick={() => {
                            resetUpload();
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          <Upload className="w-4 h-4" />
                          Upload Different File
                        </button>
                      </div>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </motion.div>
              )}

              {/* ── Idle / Selected State ── */}
              {(uploadState === "idle" || uploadState === "selected") && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() =>
                      uploadState === "idle" && fileInputRef.current?.click()
                    }
                    className={`relative m-5 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                      isDragging
                        ? "border-[#22D3EE] bg-[#22D3EE]/5 scale-[1.01]"
                        : uploadState === "selected"
                          ? "border-[#2563EB]/60 bg-[#2563EB]/5 cursor-default"
                          : "border-slate-300 dark:border-slate-600 hover:border-[#2563EB]/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    }`}
                    style={{ minHeight: "260px" }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                      onChange={handleFileInput}
                    />

                    {/* Drag-and-drop pulse ring */}
                    {isDragging && (
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-[#22D3EE]"
                        animate={{ scale: [1, 1.02, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      {uploadState === "selected" && selectedFile ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/15 flex items-center justify-center mx-auto mb-4">
                            <FileCheck className="w-8 h-8 text-[#2563EB]" />
                          </div>
                          <p
                            className="text-slate-900 dark:text-white mb-1"
                            style={{ fontSize: "16px", fontWeight: 600 }}
                          >
                            {selectedFile.name}
                          </p>
                          <p
                            className="text-slate-500 dark:text-slate-400 mb-6"
                            style={{ fontSize: "13px" }}
                          >
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB ·
                            Ready to analyze
                          </p>
                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={() => startScan(selectedFile)}
                              className="btn-glow-blue px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                              style={{ fontSize: "14px", fontWeight: 700 }}
                            >
                              Analyze Now →
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadState("idle");
                                setSelectedFile(null);
                              }}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                              style={{ fontSize: "14px" }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center">
                          <motion.div
                            animate={
                              isDragging
                                ? { scale: 1.15, rotate: 5 }
                                : { scale: 1, rotate: 0 }
                            }
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                            className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-5"
                          >
                            <Upload
                              className={`w-7 h-7 ${isDragging ? "text-[#22D3EE]" : "text-slate-400 dark:text-slate-500"}`}
                            />
                          </motion.div>
                          <p
                            className="text-slate-900 dark:text-white mb-1.5"
                            style={{ fontSize: "17px", fontWeight: 700 }}
                          >
                            {isDragging
                              ? "Drop your file here"
                              : "Drag & drop your media"}
                          </p>
                          <p
                            className="text-slate-400 dark:text-slate-500 mb-5"
                            style={{ fontSize: "13px" }}
                          >
                            or click to browse files from your device
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {["JPG", "PNG", "MP4", "MOV", "MP3", "WAV"].map(
                              (fmt) => (
                                <span
                                  key={fmt}
                                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                  style={{ fontSize: "11px", fontWeight: 600 }}
                                >
                                  {fmt}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Type buttons */}
                  {uploadState === "idle" && (
                    <div className="px-5 pb-5 grid grid-cols-3 gap-3">
                      {typeButtons.map(({ label, icon: Icon, accept, ext }) => (
                        <button
                          key={label}
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = accept;
                              fileInputRef.current.click();
                            }
                          }}
                          className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 transition-all duration-200 hover:shadow-md hover:shadow-blue-500/5"
                        >
                          <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-[#2563EB] dark:group-hover:text-[#22D3EE] transition-colors" />
                          <span
                            className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                            style={{ fontSize: "12px", fontWeight: 600 }}
                          >
                            {label}
                          </span>
                          <span
                            className="text-slate-400 dark:text-slate-600"
                            style={{ fontSize: "10px" }}
                          >
                            {ext}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Scanning / Done State ── */}
              {(uploadState === "scanning" || uploadState === "done") && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-8"
                >
                  {/* AI animation */}
                  <div
                    className="relative mx-auto mb-8 rounded-xl overflow-hidden bg-slate-900 dark:bg-[#0F172A]"
                    style={{
                      height: "180px",
                      width: "100%",
                      maxWidth: "400px",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-[#22D3EE]"
                      style={{
                        boxShadow: "0 0 16px #22D3EE, 0 0 32px #22D3EE60",
                      }}
                      animate={{ top: ["5%", "95%", "5%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full border border-[#22D3EE]/30"
                          animate={{
                            scale: [1, 1.5 + i * 0.3],
                            opacity: [0.5, 0],
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.4,
                            repeat: Infinity,
                          }}
                          style={{ width: 60, height: 60 }}
                        />
                      ))}
                      <div className="w-12 h-12 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-[#22D3EE]" />
                      </div>
                    </div>
                    {[
                      "top-2 left-2",
                      "top-2 right-2",
                      "bottom-2 left-2",
                      "bottom-2 right-2",
                    ].map((pos) => (
                      <div
                        key={pos}
                        className={`absolute ${pos} w-4 h-4 border-[#22D3EE]/60`}
                        style={{ borderWidth: "2px 0 0 2px" }}
                      />
                    ))}
                  </div>

                  <div className="text-center mb-6">
                    <p
                      className="text-slate-900 dark:text-white mb-1"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Analyzing with AI...
                    </p>
                    <motion.p
                      key={scanPhase}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[#22D3EE]"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      {scanPhase}
                    </motion.p>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between mb-2">
                      <span
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: "12px", fontWeight: 500 }}
                      >
                        {selectedFile?.name}
                      </span>
                      <span
                        className="text-[#22D3EE]"
                        style={{ fontSize: "12px", fontWeight: 700 }}
                      >
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
                        style={{
                          width: `${progress}%`,
                          boxShadow: "0 0 8px rgba(34,211,238,0.5)",
                        }}
                      />
                    </div>
                  </div>

                  {uploadState === "done" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 text-emerald-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>
                        Analysis complete! Redirecting...
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel */}
          <div className="space-y-5">
            {/* Tips */}
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-5">
              <h3
                className="text-slate-900 dark:text-white mb-4"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                Detection Tips
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: Shield,
                    text: "Files up to 500MB supported",
                    color: "text-[#2563EB]",
                  },
                  {
                    icon: AlertCircle,
                    text: "Higher resolution = better accuracy",
                    color: "text-amber-500",
                  },
                  {
                    icon: CheckCircle2,
                    text: "Results ready in under 30 seconds",
                    color: "text-emerald-500",
                  },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                    <span
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "13px" }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent scans */}
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-slate-900 dark:text-white"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  Recent Scans
                </h3>
                <button
                  onClick={() => navigate("/history")}
                  className="text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.name}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      {scan.type === "Video" ? (
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                      ) : scan.type === "Image" ? (
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-slate-900 dark:text-slate-200 truncate"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        {scan.name}
                      </p>
                      <p
                        className={`${scan.color}`}
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        {scan.verdict}
                      </p>
                    </div>
                    <span
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "12px", fontWeight: 700 }}
                    >
                      {scan.risk}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats mini */}
            <div className="rounded-2xl bg-gradient-to-br from-[#2563EB] to-blue-800 p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-blue-200" />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  Your Stats
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "24", label: "Total Scans" },
                  { value: "8", label: "Deepfakes" },
                  { value: "33%", label: "Fake Rate" },
                  { value: "97%", label: "Confidence" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: "22px", fontWeight: 800 }}>
                      {s.value}
                    </div>
                    <div className="text-blue-200" style={{ fontSize: "11px" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error State Demo Panel */}
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                <h3
                  className="text-slate-700 dark:text-slate-400"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Test Error States
                </h3>
              </div>
              <p
                className="text-slate-400 mb-3"
                style={{ fontSize: "11px", lineHeight: 1.5 }}
              >
                Preview each error design:
              </p>
              <div className="space-y-1.5">
                {demoErrors.map(({ label, type, color }) => (
                  <button
                    key={type}
                    onClick={() => triggerError(type)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.replace("text-", "bg-")}`}
                    />
                    <span
                      className="text-slate-600 dark:text-slate-400"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
