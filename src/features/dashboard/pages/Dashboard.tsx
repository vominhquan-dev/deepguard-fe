import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  Download,
  Eye,
  Clock,
  Layers,
  ChevronDown,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useMediaUpload } from "../../detection/hooks/useMediaUpload";
import { useDetectionResults } from "../../detection/hooks/useDetectionResults";

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

export function Dashboard() {
  const navigate = useNavigate();
  const {
    upload,
    uploading,
    progress,
    error: uploadError,
    detection,
    data,
  } = useMediaUpload();
  const { results: recentResults, loading: resultsLoading } =
    useDetectionResults();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress_display, setProgressDisplay] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create/revoke object URL for image preview
  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const scanPhases = [
    "Initializing AI models...",
    "Extracting media features...",
    "Analyzing with neural network...",
    "Running deepfake classifiers...",
    "Generating risk report...",
  ];

  const getDetectionPrediction = (r: { resultLabel?: string }) =>
    r.resultLabel || "REAL";
  const getDetectionFakeProb = (r: { fakeScore?: number }): number =>
    r.fakeScore ?? 0;
  const getDetectionRealProb = (r: { confidence?: number }): number =>
    r.confidence ?? 1;

  const getRiskScore = (result: NonNullable<typeof detection>) =>
    Math.max(
      result.aiGeneratedScore ?? 0,
      result.deepfakeScore ?? 0,
      result.aiGeneratedAudioScore ?? 0,
    );

  const getAuthenticScore = (result: NonNullable<typeof detection>) =>
    result.notAiGeneratedScore ?? result.confidence ?? 0;

  const triggerError = (type: ErrorType) => {
    setErrorType(type);
    setUploadState("error");
    setSelectedFile(null);
  };

  // Handle upload errors
  useEffect(() => {
    if (uploadError) {
      if (uploadError.includes("Network") || uploadError.includes("failed")) {
        triggerError("network_error");
      } else if (uploadError.includes("format")) {
        triggerError("unsupported_format");
      } else {
        triggerError("analysis_failed");
      }
      toast.error(uploadError);
    }
  }, [uploadError]);

  // Handle upload progress
  useEffect(() => {
    if (progress && uploading) {
      setProgressDisplay(progress.percentage);
      if (progress.percentage === 100) {
        toast.success("File uploaded! Starting analysis...");
      }
    }
  }, [progress, uploading]);

  const resetUpload = () => {
    setUploadState("idle");
    setSelectedFile(null);
    setProgressDisplay(0);
    setErrorType(null);
  };

  const isImageFile = selectedFile?.type.startsWith("image/");

  const startScan = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setUploadState("scanning");
      setProgressDisplay(0);
      toast.info(`Uploading ${file.name}...`, { duration: 2000 });

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          triggerError("network_error");
          toast.error("Authentication required. Please login again.");
          return;
        }

        // Upload file to server and receive AI detection results
        const uploadData = await upload(file, token);

        // Store AI detection result for Results page
        if (uploadData?.detection) {
          const result = uploadData.detection;
          localStorage.setItem(
            "lastDetection",
            JSON.stringify({
              prediction: result.prediction,
              fakeProbability: getRiskScore(result),
              realProbability: getAuthenticScore(result),
              imageUrl: uploadData.originalUrl,
            }),
          );
          localStorage.setItem("lastUploadData", JSON.stringify(uploadData));
        }

        // Show scanning animation briefly with real detection status
        let currentPhase = 0;
        setScanPhase(scanPhases[0]);

        const interval = setInterval(() => {
          setProgressDisplay((p) => {
            const next = p + 2;
            const phaseIdx = Math.floor((next / 100) * scanPhases.length);
            if (phaseIdx < scanPhases.length && phaseIdx !== currentPhase) {
              currentPhase = phaseIdx;
              setScanPhase(scanPhases[phaseIdx]);
            }
            if (next >= 100) {
              clearInterval(interval);
              setUploadState("done");
              toast.success("Analysis complete!");
            }
            return Math.min(next, 100);
          });
        }, 60);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        toast.error(message);
      }
    },
    [navigate, upload],
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

  const handleDownloadReport = () => {
    if (!data || !detection) return;
    const report = {
      fileName: selectedFile?.name || data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploadedAt: data.uploadedAt,
      analysis: {
        prediction: detection.prediction,
        fakeProbability: getRiskScore(detection),
        realProbability: getAuthenticScore(detection),
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deepguard-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
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

  const isFakePrediction = (prediction: string) =>
    ["AI_GENERATED", "AI_GENERATED_AND_DEEPFAKE", "AI_GENERATED_AUDIO", "DEEPFAKE"].includes(
      prediction,
    );

  const getVerdictColor = (prediction: string) => {
    if (isFakePrediction(prediction)) {
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
        bar: "bg-red-500",
        barBg: "bg-red-500/20",
      };
    }
    return {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      bar: "bg-emerald-500",
      barBg: "bg-emerald-500/20",
    };
  };

  const getVerdictLabel = (prediction: string) => {
    if (isFakePrediction(prediction)) return "Deepfake";
    return "Real";
  };

  const getVerdictIcon = (prediction: string) => {
    if (isFakePrediction(prediction)) return AlertTriangle;
    return CheckCircle2;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const formatRelativeTime = (dateStr: string) => {
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
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case "IMAGE":
        return "Image";
      case "VIDEO":
        return "Video";
      case "AUDIO":
        return "Audio";
      default:
        return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-slate-900 dark:text-white"
              style={{ fontSize: "24px", fontWeight: 800 }}
            >
              Detection Dashboard
            </h1>
            <p
              className="text-slate-500 dark:text-slate-400 mt-1"
              style={{ fontSize: "14px" }}
            >
              Upload media to detect AI-generated or manipulated content
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left Column */}
            <div>
              <AnimatePresence mode="wait">
                {/* ── Error State ── */}
                {uploadState === "error" && errorType && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    {(() => {
                      const cfg = errorConfigs[errorType];
                      return (
                        <div className="p-6">
                          <div
                            className={`flex items-center gap-3 mb-5 ${cfg.border} border rounded-xl p-4 ${cfg.bg}`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}
                            >
                              <cfg.icon
                                className={`w-5 h-5 ${cfg.iconColor}`}
                              />
                            </div>
                            <div>
                              <p
                                className="text-slate-900 dark:text-white"
                                style={{ fontSize: "15px", fontWeight: 700 }}
                              >
                                {cfg.title}
                              </p>
                              <p
                                className="text-slate-500 dark:text-slate-400"
                                style={{ fontSize: "12px" }}
                              >
                                {cfg.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 mb-5">
                            <RefreshCw className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#22D3EE] mt-0.5 flex-shrink-0" />
                            <p
                              className="text-slate-500 dark:text-slate-400"
                              style={{ fontSize: "12px" }}
                            >
                              {cfg.hint}
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={resetUpload}
                              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all"
                              style={{ fontSize: "13px", fontWeight: 700 }}
                            >
                              Try Again
                            </button>
                            <button
                              onClick={() => navigate("/support")}
                              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                              style={{ fontSize: "13px", fontWeight: 600 }}
                            >
                              Contact Support
                            </button>
                          </div>
                        </div>
                      );
                    })()}
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
                          animate={{
                            scale: [1, 1.02, 1],
                            opacity: [1, 0.5, 1],
                          }}
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
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              · Ready to analyze
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
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 600,
                                    }}
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
                        {typeButtons.map(
                          ({ label, icon: Icon, accept, ext }) => (
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
                          ),
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Scanning / Done State ── */}
                {(uploadState === "scanning" || uploadState === "done") && (
                  <motion.div
                    key={uploadState === "done" ? "result" : "scanning"}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    {uploadState === "scanning" && (
                      <div className="p-8">
                        {/* Image with Scan Overlay */}
                        <div
                          className="relative mx-auto mb-8 rounded-xl overflow-hidden bg-slate-900 dark:bg-[#0F172A]"
                          style={{
                            height:
                              isImageFile && previewUrl ? "auto" : "180px",
                            width: "100%",
                            maxWidth: "400px",
                            aspectRatio: isImageFile ? "auto" : undefined,
                          }}
                        >
                          {isImageFile && previewUrl ? (
                            <>
                              <img
                                src={previewUrl}
                                alt={selectedFile?.name || "Upload preview"}
                                className="w-full h-full object-contain rounded-xl"
                                style={{ maxHeight: "300px" }}
                              />
                              {/* Scanning overlay */}
                              <div className="absolute inset-0 pointer-events-none">
                                {/* Grid overlay */}
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage:
                                      "linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px)",
                                    backgroundSize: "20px 20px",
                                  }}
                                />
                                {/* Scan line */}
                                <motion.div
                                  className="absolute left-0 right-0 h-0.5 bg-[#22D3EE]"
                                  style={{
                                    boxShadow:
                                      "0 0 16px #22D3EE, 0 0 32px #22D3EE60",
                                  }}
                                  animate={{ top: ["5%", "95%", "5%"] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />
                                {/* Corner brackets */}
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
                                {/* Pulse ring center */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {[1, 2, 3].map((i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute rounded-full border border-[#22D3EE]/40"
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
                                  <div className="w-12 h-12 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center backdrop-blur-sm">
                                    <Cpu className="w-5 h-5 text-[#22D3EE]" />
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            /* Fallback: abstract animation for non-image files */
                            <>
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
                                  boxShadow:
                                    "0 0 16px #22D3EE, 0 0 32px #22D3EE60",
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
                            </>
                          )}
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
                              {Math.round(progress_display)}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
                              style={{
                                width: `${progress_display}%`,
                                boxShadow: "0 0 8px rgba(34,211,238,0.5)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Results Card ── */}
                    {uploadState === "done" &&
                      detection &&
                      data &&
                      selectedFile && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-6"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-5">
                            <div>
                              <h2
                                className="text-slate-900 dark:text-white"
                                style={{ fontSize: "20px", fontWeight: 800 }}
                              >
                                Detection Results
                              </h2>
                              <p
                                className="text-slate-500 dark:text-slate-400 mt-0.5"
                                style={{ fontSize: "13px" }}
                              >
                                Analysis complete for{" "}
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {selectedFile.name}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-3 mb-6">
                            <button
                              onClick={resetUpload}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all"
                              style={{ fontSize: "13px", fontWeight: 700 }}
                            >
                              <Upload className="w-4 h-4" />
                              Scan Another
                            </button>
                            <button
                              onClick={handleDownloadReport}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                              style={{ fontSize: "13px", fontWeight: 600 }}
                            >
                              <Download className="w-4 h-4" />
                              Download Report
                            </button>
                            <button
                              onClick={() => navigate("/results")}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ml-auto"
                              style={{ fontSize: "13px", fontWeight: 600 }}
                            >
                              <Eye className="w-4 h-4" />
                              View Full Report
                            </button>
                          </div>

                          {/* Image Preview */}
                          {isImageFile && previewUrl && (
                            <div className="mb-5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img
                                src={previewUrl}
                                alt={selectedFile.name}
                                className="w-full h-full object-contain max-h-[300px]"
                              />
                            </div>
                          )}

                          {/* AI Verdict Message */}
                          <div
                            className={`flex items-start gap-3 p-4 rounded-xl mb-5 ${
                              isFakePrediction(detection.prediction)
                                ? "bg-red-500/5 border border-red-500/20"
                                : "bg-emerald-500/5 border border-emerald-500/20"
                            }`}
                          >
                            {isFakePrediction(detection.prediction) ? (
                              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            )}
                            <p
                              className={`text-sm ${
                                isFakePrediction(detection.prediction)
                                  ? "text-red-600 dark:text-red-300"
                                  : "text-emerald-600 dark:text-emerald-300"
                              }`}
                            >
                              {isFakePrediction(detection.prediction)
                                ? "Deepfake or AI-generated content detected in this media."
                                : "This media appears to be authentic."}
                            </p>
                          </div>

                          {/* File info line */}
                          <div className="flex items-center gap-2 text-slate-400 mb-6 text-xs">
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                              {selectedFile.name}
                            </span>
                            <span>·</span>
                            <span>{formatFileSize(data.fileSize)}</span>
                            <span>·</span>
                            <span>{getFileTypeLabel(data.fileType)}</span>
                          </div>

                          {/* Main verdict card */}
                          {(() => {
                            const verdict = getVerdictColor(
                              detection.prediction,
                            );
                            const VerdictIcon = getVerdictIcon(
                              detection.prediction,
                            );
                            const riskScore = Math.round(getRiskScore(detection) * 100);

                            return (
                              <div
                                className={`rounded-xl border ${verdict.border} ${verdict.bg} p-6 mb-6`}
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-white/5 flex items-center justify-center">
                                    <VerdictIcon
                                      className={`w-5 h-5 ${verdict.text}`}
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className={`font-bold text-lg ${verdict.text}`}
                                    >
                                      {isFakePrediction(detection.prediction)
                                        ? "⚠ DEEPFAKE DETECTED"
                                        : "✓ AUTHENTIC CONTENT"}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                                      AI Verdict
                                    </p>
                                  </div>
                                </div>

                                {/* Stats grid - Prediction / Fake Prob / Real Prob */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3">
                                    <p className="text-slate-400 text-xs mb-0.5">
                                      Prediction
                                    </p>
                                    <p
                                      className={`font-bold text-sm ${verdict.text}`}
                                    >
                                      {detection.prediction}
                                    </p>
                                  </div>
                                  <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3">
                                    <p className="text-slate-400 text-xs mb-0.5">
                                      Fake Prob.
                                    </p>
                                    <p className="font-bold text-sm text-red-500">
                                      {(getRiskScore(detection) * 100).toFixed(
                                        2,
                                      )}
                                      %
                                    </p>
                                  </div>
                                  <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3">
                                    <p className="text-slate-400 text-xs mb-0.5">
                                      Real Prob.
                                    </p>
                                    <p className="font-bold text-sm text-emerald-500">
                                      {(getAuthenticScore(detection) * 100).toFixed(
                                        2,
                                      )}
                                      %
                                    </p>
                                  </div>
                                </div>

                                {/* File info row */}
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                  <span>{getFileTypeLabel(data.fileType)}</span>
                                  <span>·</span>
                                  <span>{formatFileSize(data.fileSize)}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}

                    {uploadState === "done" && !detection && (
                      <div className="p-8 flex flex-col items-center justify-center gap-3">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        <p className="text-slate-900 dark:text-white font-semibold text-sm">
                          Analysis complete!
                        </p>
                        <button
                          onClick={resetUpload}
                          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all"
                          style={{ fontSize: "13px", fontWeight: 700 }}
                        >
                          Scan Another File
                        </button>
                      </div>
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
                      <Icon
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`}
                      />
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

              {/* Recent Scans */}
              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-slate-900 dark:text-white"
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Recent Scans
                  </h3>
                  {resultsLoading && (
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                  )}
                </div>
                {resultsLoading && recentResults.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
                      />
                    ))}
                  </div>
                ) : recentResults.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-slate-400" />
                    </div>
                    <p
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "13px" }}
                    >
                      No scans yet
                    </p>
                    <p
                      className="text-slate-400 dark:text-slate-500"
                      style={{ fontSize: "11px" }}
                    >
                      Upload your first media file to see results here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentResults.slice(0, 5).map((result) => {
                      const prediction = getDetectionPrediction(result);
                      const isFake = prediction === "FAKE";
                      const fakeProb = getDetectionFakeProb(result);
                      const realProb = getDetectionRealProb(result);
                      const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(
                        result.fileName,
                      );
                      return (
                        <button
                          key={result.detectionResultId}
                          onClick={() => {
                            localStorage.setItem(
                              "lastDetection",
                              JSON.stringify({
                                detectionResultId: result.detectionResultId,
                                scanJobId: result.scanJobId,
                                prediction,
                                fakeProbability: fakeProb,
                                realProbability: realProb,
                                imageUrl: result.originalUrl,
                                fileName: result.fileName,
                                modelVersion: result.modelVersion,
                                processedAt: result.processedAt,
                                email: result.email,
                                mediaId: result.mediaId,
                              }),
                            );
                            navigate("/results");
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all text-left group"
                        >
                          {isImage && result.originalUrl ? (
                            <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-600">
                              <img
                                src={result.originalUrl}
                                alt={result.fileName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isFake
                                  ? "bg-red-500/10 group-hover:bg-red-500/15"
                                  : "bg-emerald-500/10 group-hover:bg-emerald-500/15"
                              }`}
                            >
                              {isFake ? (
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className="text-slate-900 dark:text-white truncate font-medium"
                                style={{ fontSize: "12px" }}
                              >
                                {result.fileName}
                              </p>
                              {result.processedAt && (
                                <span className="text-slate-400 text-[10px] flex-shrink-0">
                                  {formatRelativeTime(result.processedAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-xs font-semibold ${
                                  isFake ? "text-red-400" : "text-emerald-400"
                                }`}
                              >
                                {prediction}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-400 text-xs">
                                Fake: {(fakeProb * 100)?.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
