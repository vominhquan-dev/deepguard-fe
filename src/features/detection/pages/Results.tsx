import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Eye,
  X,
  Copy,
  Printer,
  Shield,
  FileText,
  Info,
  HelpCircle,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { toast } from "sonner";
import { useAuth } from "../../auth/context/AuthContext";
import { downloadScanReportPdf } from "../api/reportApi";
import { useCredits } from "../../billing/hooks/useCredits";
interface DetectionData {
  detectionResultId?: string;
  scanJobId?: string;
  prediction: string;
  fakeProbability: number;
  realProbability: number;
  imageUrl?: string | null;
  message?: string | null;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
  mediaId?: string;
  email?: string;
  type?: string;
}

// ── Verdict Badge ──
function VerdictBadge({ prediction }: { prediction: string }) {
  const isReal =
    prediction?.toUpperCase() === "REAL" ||
    prediction?.toUpperCase() === "AUTHENTIC" ||
    prediction?.toUpperCase() === "HUMAN";
  const isFake =
    prediction?.toUpperCase() === "FAKE" ||
    prediction?.toUpperCase() === "DEEPFAKE";
  const isSuspicious = prediction?.toUpperCase() === "SUSPICIOUS";

  const color = isReal
    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
    : isFake
      ? "bg-red-500/10 text-red-500 border-red-500/30"
      : "bg-amber-500/10 text-amber-500 border-amber-500/30";

  const icon = isReal ? (
    <CheckCircle2 className="w-4 h-4" />
  ) : isFake ? (
    <AlertTriangle className="w-4 h-4" />
  ) : (
    <HelpCircle className="w-4 h-4" />
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold ${color}`}
    >
      {icon}
      {prediction || "REAL"}
    </span>
  );
}

// ── Stat Card ──
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
        {label}
      </p>
      <p className={`text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

// ── Full Report Modal ──
function ReportModal({
  detection,
  onClose,
}: {
  detection: DetectionData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const reportText = `DeepGuard Detection Report
File: ${detection.fileName || "Unknown"}
Verdict: ${detection.prediction}
Fake Probability: ${(detection.fakeProbability * 100).toFixed(2)}%
Real Probability: ${(detection.realProbability * 100).toFixed(2)}%
Processed At: ${detection.uploadedAt ? new Date(detection.uploadedAt).toLocaleString() : "N/A"}`;
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
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-700"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold">
              Detection Report
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* AI Verdict Highlight */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                detection.prediction?.toUpperCase() === "REAL" ||
                detection.prediction?.toUpperCase() === "AUTHENTIC" ||
                detection.prediction?.toUpperCase() === "HUMAN"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {detection.prediction?.toUpperCase() === "REAL" ||
              detection.prediction?.toUpperCase() === "AUTHENTIC" ||
              detection.prediction?.toUpperCase() === "HUMAN" ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>
            <div>
              <p className="text-slate-900 dark:text-white text-base font-bold">
                {detection.prediction?.toUpperCase() === "REAL" ||
                detection.prediction?.toUpperCase() === "AUTHENTIC" ||
                detection.prediction?.toUpperCase() === "HUMAN"
                  ? "AUTHENTIC CONTENT"
                  : "AI-GENERATED / MANIPULATED"}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                AI Verdict
              </p>
            </div>
          </div>
        </div>

        {/* Detail Stats */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              Prediction
            </p>
            <p
              className={`text-base font-black ${
                detection.prediction?.toUpperCase() === "REAL" ||
                detection.prediction?.toUpperCase() === "AUTHENTIC" ||
                detection.prediction?.toUpperCase() === "HUMAN"
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {detection.prediction}
            </p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              Fake Prob.
            </p>
            <p className="text-red-500 text-base font-black">
              {(detection.fakeProbability * 100).toFixed(2)}%
            </p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              Real Prob.
            </p>
            <p className="text-emerald-500 text-base font-black">
              {(detection.realProbability * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* File Info */}
        {detection.fileName && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300 text-sm">
                {detection.fileName}
              </span>
              {detection.fileSize && (
                <span className="text-slate-400 text-xs ml-auto">
                  {(detection.fileSize / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>
        )}

        {/* Message */}
        {detection.message && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-6">
            <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
              {detection.message}
            </p>
          </div>
        )}

        <div className="flex gap-3">
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
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Results Page ──
export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();
  const [detection, setDetection] = useState<DetectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const { credits } = useCredits();

  const handleDownloadPdf = async () => {
    if (!detection?.scanJobId) {
      toast.error("No scan job ID available for this detection.");
      return;
    }
    if (!accessToken) {
      toast.error("Please log in again to download reports.");
      return;
    }
    setDownloadingPdf(true);
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
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    // Priority 1: check location state (navigated from History, etc.)
    const locationState = location.state as DetectionData | null;
    if (locationState && locationState.prediction) {
      setDetection(locationState);
      setLoading(false);
      return;
    }

    // Priority 2: read from localStorage (saved after scan)
    const stored = localStorage.getItem("lastDetection");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const data: DetectionData = {
          prediction: parsed.prediction || "REAL",
          fakeProbability: parsed.fakeProbability ?? 0,
          realProbability: parsed.realProbability ?? 1,
          imageUrl: parsed.imageUrl ?? null,
          message: parsed.message ?? null,
        };
        // Try to get more info from lastUploadData (includes originalUrl for image preview)
        const uploadDataStr = localStorage.getItem("lastUploadData");
        if (uploadDataStr) {
          try {
            const uploadData = JSON.parse(uploadDataStr);
            data.fileName = uploadData.fileName;
            data.fileType = uploadData.fileType;
            data.fileSize = uploadData.fileSize;
            data.uploadedAt = uploadData.uploadedAt;
            data.mediaId = uploadData.id;
            data.scanJobId = uploadData.id;
            // Use originalUrl from upload response for image preview (fallback to imageUrl from aiDetect)
            data.imageUrl = uploadData.originalUrl || data.imageUrl;
          } catch {}
        }
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-start justify-between gap-4 mb-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 rounded-full bg-[#22D3EE]" />
                <h1 className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">
                  Detection Results
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 ml-3 text-sm">
                {detection.fileName
                  ? `Analysis complete for ${detection.fileName}`
                  : "Analysis complete"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/detect")}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 text-sm font-bold"
              >
                Scan Another
              </button>
            </div>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            {/* Verdict Badge */}
            <div className="flex justify-center mb-6">
              <VerdictBadge prediction={detection.prediction} />
            </div>

            {/* Scanned Image Preview */}
            {detection.imageUrl && (
              <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={detection.imageUrl}
                  alt={detection.fileName || "Scanned image"}
                  className="w-full h-auto max-h-80 object-contain bg-slate-100 dark:bg-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Stats Cards */}
            <div className="flex gap-3 mb-6">
              <StatCard
                label="Prediction"
                value={detection.prediction}
                color={
                  detection.prediction?.toUpperCase() === "REAL" ||
                  detection.prediction?.toUpperCase() === "AUTHENTIC" ||
                  detection.prediction?.toUpperCase() === "HUMAN"
                    ? "text-emerald-500"
                    : "text-red-500"
                }
              />
              <StatCard
                label="Fake Probability"
                value={`${(detection.fakeProbability * 100).toFixed(2)}%`}
                color="text-red-500"
              />
              <StatCard
                label="Real Probability"
                value={`${(detection.realProbability * 100).toFixed(2)}%`}
                color="text-emerald-500"
              />
            </div>

            {/* AI Verdict Highlight */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    detection.prediction?.toUpperCase() === "REAL" ||
                    detection.prediction?.toUpperCase() === "AUTHENTIC" ||
                    detection.prediction?.toUpperCase() === "HUMAN"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {detection.prediction?.toUpperCase() === "REAL" ||
                  detection.prediction?.toUpperCase() === "AUTHENTIC" ||
                  detection.prediction?.toUpperCase() === "HUMAN" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white text-base font-bold">
                    {detection.prediction?.toUpperCase() === "REAL" ||
                    detection.prediction?.toUpperCase() === "AUTHENTIC" ||
                    detection.prediction?.toUpperCase() === "HUMAN"
                      ? "AUTHENTIC CONTENT"
                      : "AI-GENERATED / MANIPULATED"}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    AI Verdict
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {detection.message && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-4">
                <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                  {detection.message}
                </p>
              </div>
            )}

            {/* File info */}
            {detection.fileName && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300 text-sm">
                    {detection.fileName}
                  </span>
                  {detection.fileSize && (
                    <span className="text-slate-400 text-xs ml-auto">
                      {(detection.fileSize / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Remaining Credits */}
          {credits && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5 border border-blue-100 dark:border-blue-500/10"
            >
              <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                <span className="text-[#2563EB] text-sm font-black">
                  {credits.remainingCredits}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Remaining Credits
                </span>{" "}
                — you have{" "}
                <span className="font-bold text-[#2563EB]">
                  {credits.remainingCredits}
                </span>{" "}
                detection
                {credits.remainingCredits !== 1 ? "s" : ""} left
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 mt-6"
          >
            <button
              onClick={() => setShowReport(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm font-semibold"
            >
              <Info className="w-4 h-4" />
              View Full Report
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all text-sm font-semibold disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloadingPdf ? "Downloading..." : "Download Report"}
            </button>
          </motion.div>
        </div>

        {/* Report Modal */}
        {showReport && (
          <ReportModal
            detection={detection}
            onClose={() => setShowReport(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
