import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck2,
  FileImage,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Mic,
  Play,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Upload,
  Video,
  X,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useMediaUpload } from "../../detection/hooks/useMediaUpload";
import { useDetectionResults } from "../../detection/hooks/useDetectionResults";
import { triggerCreditsRefetch } from "../../billing/hooks/useCredits";
import { downloadScanReportPdf } from "../../detection/api/reportApi";
import { useAuth } from "../../auth/context/AuthContext";
import i18n from "../../../shared/i18n/config";
import { useTranslation } from "react-i18next";

type UploadState = "idle" | "selected" | "scanning" | "done" | "error";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const SUPPORTED_FORMATS = [
  "JPG",
  "PNG",
  "WEBP",
  "MP4",
  "MOV",
  "AVI",
  "MP3",
  "WAV",
  "M4A",
];

function isRiskyPrediction(prediction: string) {
  return [
    "AI_GENERATED",
    "AI_GENERATED_AND_DEEPFAKE",
    "AI_GENERATED_AUDIO",
    "DEEPFAKE",
    "FAKE",
  ].includes(prediction.toUpperCase());
}

function isTrustedPrediction(prediction: string) {
  return ["REAL", "AUTHENTIC", "HUMAN", "NOT_AI_GENERATED"].includes(
    prediction.toUpperCase(),
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatRelativeTime(value: string, language: string) {
  const normalizedValue = value.endsWith("Z") ? value : `${value}Z`;
  const date = new Date(normalizedValue);
  const difference = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(difference / 60_000));

  if (minutes < 1) return language === "vi" ? "Vừa xong" : "Just now";
  if (minutes < 60) return language === "vi" ? `${minutes} phút trước` : `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return language === "vi" ? `${hours} giờ trước` : `${hours}h ago`;
  return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit" });
}

function FileTypeIcon({
  type,
  className = "",
}: {
  type: string;
  className?: string;
}) {
  const normalizedType = type.toLowerCase();
  if (normalizedType.startsWith("image") || type === "IMAGE") {
    return <ImageIcon className={className} />;
  }
  if (normalizedType.startsWith("video") || type === "VIDEO") {
    return <Video className={className} />;
  }
  if (normalizedType.startsWith("audio") || type === "AUDIO") {
    return <Mic className={className} />;
  }
  return <FileText className={className} />;
}

/**
 * This page deliberately keeps the original upload/result contract intact.
 * Presentation is local to this component; upload adapters, cache keys and the
 * video Hive payload remain the same ones consumed by Results.tsx.
 */
export function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n: activeI18n } = useTranslation();
  const {
    upload,
    reset,
    uploading,
    progress,
    error: uploadError,
    aiDetect,
    hiveDetect,
    data,
  } = useMediaUpload();
  const {
    results: recentResults,
    loading: recentLoading,
    refetch: refetchResults,
  } = useDetectionResults();
  const { accessToken, userInfo } = useAuth();

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [progressDisplay, setProgressDisplay] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile?.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!uploadError) return;
    setLocalError(uploadError);
    setUploadState("error");
  }, [uploadError]);

  useEffect(() => {
    if (uploading && progress) {
      setProgressDisplay(progress.percentage);
    }
  }, [progress, uploading]);

  const resetUpload = useCallback(() => {
    reset();
    setSelectedFile(null);
    setLocalError(null);
    setProgressDisplay(0);
    setScanPhase("");
    setUploadState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [reset]);

  const selectFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setLocalError(t("workspace.detect.fileTooLarge"));
      setUploadState("error");
      return;
    }

    if (!/(image|video|audio)\//.test(file.type)) {
      setLocalError(t("workspace.detect.unsupportedFormat"));
      setUploadState("error");
      return;
    }

    setSelectedFile(file);
    setLocalError(null);
    setProgressDisplay(0);
    setUploadState("selected");
  }, [t]);

  const openFilePicker = useCallback((accept = "image/*,video/*,audio/*") => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  }, []);

  const startScan = useCallback(async () => {
    if (!selectedFile) return;

    const token = accessToken || localStorage.getItem("accessToken");
    if (!token) {
      setLocalError(i18n.t("errors.api.authRequired"));
      setUploadState("error");
      return;
    }

    setUploadState("scanning");
    setLocalError(null);
    setProgressDisplay(0);
    setScanPhase(t("workspace.detect.uploading"));
    toast.info(t("workspace.detect.uploadingFile", { fileName: selectedFile.name }), { duration: 2_000 });

    try {
      // Keep the established FE → BE contract. The backend owns Hive/provider calls.
      const uploadData = await upload(selectedFile, token);

      triggerCreditsRefetch();
      refetchResults();

      const prefix = userInfo?.email || userInfo?.id || "anonymous";

      // Preserve the exact per-user cache contracts read by Results.tsx.
      if (uploadData?.aiDetect) {
        localStorage.setItem(
          `lastDetection_${prefix}`,
          JSON.stringify({
            prediction: uploadData.aiDetect.prediction,
            fakeProbability: uploadData.aiDetect.fakeProbability,
            realProbability: uploadData.aiDetect.realProbability,
            imageUrl: uploadData.aiDetect.imageUrl ?? null,
            message: uploadData.aiDetect.message ?? null,
            scanJobId: uploadData.scanJobId,
          }),
        );
      }

      if (uploadData?.hiveDetect) {
        localStorage.setItem(
          `lastDetectionHive_${prefix}`,
          JSON.stringify({
            prediction: uploadData.hiveDetect.prediction,
            confidence: uploadData.hiveDetect.confidence,
            aiGeneratedScore: uploadData.hiveDetect.aiGeneratedScore,
            notAiGeneratedScore: uploadData.hiveDetect.notAiGeneratedScore,
            deepfakeScore: uploadData.hiveDetect.deepfakeScore,
            aiGeneratedAudioScore: uploadData.hiveDetect.aiGeneratedAudioScore,
            notAiGeneratedAudioScore: uploadData.hiveDetect.notAiGeneratedAudioScore,
            attributedGenerator: uploadData.hiveDetect.attributedGenerator,
            frames: uploadData.hiveDetect.frames,
            taskId: uploadData.hiveDetect.taskId,
            mediaUrl: uploadData.hiveDetect.mediaUrl,
            video: uploadData.hiveDetect.video,
            scanJobId: uploadData.scanJobId,
          }),
        );
      }

      localStorage.setItem(`lastUploadData_${prefix}`, JSON.stringify(uploadData));

      const phases = [
        t("workspace.detect.uploading"),
        t("detection.processing"),
        t("workspace.detect.analyzing"),
      ];
      let phaseIndex = 0;
      setScanPhase(phases[phaseIndex]);

      const interval = window.setInterval(() => {
        setProgressDisplay((current) => {
          const next = Math.min(100, Math.max(current + 4, 72));
          const nextPhaseIndex = Math.min(
            phases.length - 1,
            Math.floor((next / 100) * phases.length),
          );
          if (nextPhaseIndex !== phaseIndex) {
            phaseIndex = nextPhaseIndex;
            setScanPhase(phases[phaseIndex]);
          }
          if (next === 100) {
            window.clearInterval(interval);
            setUploadState("done");
            toast.success(t("workspace.detect.scanComplete"));
          }
          return next;
        });
      }, 90);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t("errors.api.uploadFailed");
      setLocalError(message);
      setUploadState("error");
      toast.error(message);
    }
  }, [accessToken, refetchResults, selectedFile, t, upload, userInfo]);

  const downloadReport = useCallback(async () => {
    const token = accessToken || localStorage.getItem("accessToken");
    if (!token || !data?.scanJobId) {
      toast.error(i18n.t("errors.api.noScanResultDownload"));
      return;
    }

    try {
      await downloadScanReportPdf(
        data.scanJobId,
        token,
        `deepguard-report-${Date.now()}.pdf`,
      );
      toast.success(i18n.t("errors.api.reportDownloaded"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : i18n.t("errors.api.downloadFailed"));
    }
  }, [accessToken, data?.scanJobId]);

  const openCurrentResult = useCallback(() => {
    if (!data || !selectedFile) {
      navigate("/results");
      return;
    }

    if (hiveDetect) {
      navigate("/results", {
        state: {
          prediction: hiveDetect.prediction,
          fakeProbability: hiveDetect.aiGeneratedScore,
          realProbability: hiveDetect.notAiGeneratedScore,
          imageUrl: data.originalUrl,
          fileName: selectedFile.name,
          fileType: data.fileType,
          fileSize: data.fileSize,
          uploadedAt: data.uploadedAt,
          mediaId: data.id,
          originalUrl: data.originalUrl,
          scanJobId: data.scanJobId,
          _videoHive: hiveDetect,
        },
      });
      return;
    }

    navigate("/results", {
      state: {
        prediction: aiDetect?.prediction,
        fakeProbability: aiDetect?.fakeProbability,
        realProbability: aiDetect?.realProbability,
        imageUrl: data.originalUrl,
        fileName: selectedFile.name,
        fileType: data.fileType,
        fileSize: data.fileSize,
        uploadedAt: data.uploadedAt,
        mediaId: data.id,
        originalUrl: data.originalUrl,
        scanJobId: data.scanJobId,
      },
    });
  }, [aiDetect, data, hiveDetect, navigate, selectedFile]);

  const openHistoricalResult = useCallback(
    (result: {
      detectionResultId: string;
      scanJobId: string;
      resultLabel?: string;
      fakeScore?: number;
      confidence?: number;
      originalUrl?: string;
      fileName: string;
      mediaId?: string;
      processedAt: string;
    }) => {
      navigate("/results", {
        state: {
          detectionResultId: result.detectionResultId,
          scanJobId: result.scanJobId,
          prediction: result.resultLabel,
          fakeProbability: result.fakeScore,
          realProbability: result.confidence,
          imageUrl: result.originalUrl,
          fileName: result.fileName,
          mediaId: result.mediaId,
          uploadedAt: result.processedAt,
        },
      });
    },
    [navigate],
  );

  const detection = aiDetect ?? hiveDetect;
  const prediction = detection?.prediction ?? "";
  const isRisky = isRiskyPrediction(prediction);
  const isTrusted = isTrustedPrediction(prediction);
  const riskScore = hiveDetect
    ? Math.round(
        Math.max(
          hiveDetect.aiGeneratedScore,
          hiveDetect.deepfakeScore,
          hiveDetect.aiGeneratedAudioScore,
        ) * 100,
      )
    : Math.round((aiDetect?.fakeProbability ?? 0) * 100);
  const confidence = hiveDetect
    ? hiveDetect.confidence
    : aiDetect?.realProbability ?? 0;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <header className="mb-8 max-w-2xl">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">
              {t("workspace.detect.eyebrow")}
            </p>
            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">
              {t("workspace.detect.title")}
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-slate-600 dark:text-slate-300">
              {t("workspace.detect.subtitle")}
            </p>
          </header>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]"
              aria-labelledby="upload-title"
            >
              <div className="border-b border-border px-5 py-4 sm:px-6">
                <h2 id="upload-title" className="text-[16px] font-bold text-slate-900 dark:text-white">
                  {t("workspace.detect.uploadTitle")}
                </h2>
                <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                  {t("workspace.detect.creditNote")}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/*,video/*,audio/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) selectFile(file);
                  }}
                />

                {(uploadState === "idle" || uploadState === "selected") && (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openFilePicker();
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      const file = event.dataTransfer.files[0];
                      if (file) selectFile(file);
                    }}
                    onClick={() => uploadState === "idle" && openFilePicker()}
                    className={`relative min-h-[300px] rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                      dragging
                        ? "border-primary bg-primary/[0.06]"
                        : uploadState === "selected"
                          ? "border-primary/40 bg-primary/[0.035]"
                          : "border-slate-300 bg-slate-50/70 hover:border-primary/60 hover:bg-primary/[0.025] dark:border-slate-600 dark:bg-slate-800/30"
                    }`}
                    aria-label={t("workspace.detect.dropArea")}
                  >
                    {uploadState === "idle" ? (
                      <div className="flex min-h-[250px] flex-col items-center justify-center">
                        <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Upload className="h-7 w-7" />
                        </span>
                        <h3 className="mt-5 text-[18px] font-bold text-slate-900 dark:text-white">
                          {t("workspace.detect.dropTitle")}
                        </h3>
                        <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
                          {t("workspace.detect.dropHint")}
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                          {SUPPORTED_FORMATS.map((format) => (
                            <span
                              key={format}
                              className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                            >
                              {format}
                            </span>
                          ))}
                        </div>
                        <p className="mt-5 text-[12px] text-slate-400">{t("workspace.detect.maxFile")}</p>
                      </div>
                    ) : (
                      <div className="flex min-h-[250px] flex-col items-center justify-center">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Xem trước tệp đã chọn"
                            className="mb-4 h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <span className="mb-4 grid h-16 w-16 place-items-center rounded-xl bg-primary/10 text-primary">
                            <FileTypeIcon type={selectedFile?.type || ""} className="h-8 w-8" />
                          </span>
                        )}
                        <p className="max-w-md truncate text-[16px] font-bold text-slate-900 dark:text-white">
                          {selectedFile?.name}
                        </p>
                        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                          {selectedFile && formatFileSize(selectedFile.size)} · {t("workspace.detect.selectedReady")}
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              startScan();
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm shadow-blue-500/25 transition-colors hover:bg-[#406dcc]"
                          >
                            <ScanSearch className="h-4 w-4" /> {t("workspace.detect.start")}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              resetUpload();
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-muted dark:text-slate-300"
                          >
                            <X className="h-4 w-4" /> {t("workspace.detect.chooseAgain")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {uploadState === "scanning" && (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.025] p-6 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
                      <LoaderCircle className="h-7 w-7 animate-spin" />
                    </span>
                    <h3 className="mt-5 text-[18px] font-bold text-slate-900 dark:text-white">
                      {uploading ? t("workspace.detect.uploading") : t("workspace.detect.analyzing")}
                    </h3>
                    <p className="mt-1 max-w-sm text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                      {scanPhase || t("workspace.detect.waitForResult")}
                    </p>
                    <div className="mt-6 w-full max-w-sm">
                      <div className="flex justify-between gap-4 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                        <span className="truncate">{selectedFile?.name}</span>
                        <span>{progressDisplay}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-300"
                          style={{ width: `${progressDisplay}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {uploadState === "done" && data && detection && (
                  <ResultSummary
                    fileName={data.fileName}
                    riskScore={riskScore}
                    confidence={confidence}
                    risky={isRisky}
                    trusted={isTrusted}
                    onOpen={openCurrentResult}
                    onReset={resetUpload}
                    onDownload={downloadReport}
                  />
                )}

                {uploadState === "done" && data && !detection && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-500/25 dark:bg-amber-500/[0.08]">
                    <div className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/12 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{t("workspace.detect.unableToShow")}</h3>
                        <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                          {t("workspace.detect.uploadedCanViewHistory")}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" onClick={() => navigate("/history")} className="rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground hover:bg-[#406dcc]">
                            {t("workspace.detect.openHistory")}
                          </button>
                          <button type="button" onClick={resetUpload} className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-muted dark:text-slate-300">
                            {t("workspace.detect.checkAnother")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {uploadState === "error" && (
                  <div className="rounded-xl border border-red-200 bg-red-50/70 p-5 dark:border-red-500/25 dark:bg-red-500/[0.08]">
                    <div className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/12 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{t("workspace.detect.unableToProcess")}</h3>
                        <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                          {localError || t("workspace.detect.genericUploadError")}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" onClick={resetUpload} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground hover:bg-[#406dcc]">
                            <RefreshCw className="h-3.5 w-3.5" /> {t("workspace.detect.retry")}
                          </button>
                          <button type="button" onClick={() => navigate("/contact")} className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-muted dark:text-slate-300">
                            {t("workspace.detect.contactSupport")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {uploadState === "idle" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: t("workspace.detect.chooseImage"), formats: "JPG, PNG, WEBP", icon: ImageIcon, accept: "image/*" },
                      { label: t("workspace.detect.chooseVideo"), formats: "MP4, MOV, AVI", icon: Video, accept: "video/*" },
                      { label: t("workspace.detect.chooseAudio"), formats: "MP3, WAV, M4A", icon: Mic, accept: "audio/*" },
                    ].map(({ label, formats, icon: Icon, accept }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => openFilePicker(accept)}
                        className="group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.025]"
                      >
                        <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-primary" />
                        <p className="mt-3 text-[13px] font-bold text-slate-800 dark:text-slate-100">{label}</p>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{formats}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]" aria-labelledby="tips-title">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 id="tips-title" className="text-[16px] font-bold text-slate-900 dark:text-white">{t("workspace.detect.tipsTitle")}</h2>
                </div>
                <ul className="mt-4 space-y-3 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                  <li className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{t("workspace.detect.tipMaxFile")}</li>
                  <li className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{t("workspace.detect.tipQuality")}</li>
                  <li className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{t("workspace.detect.tipAdvisory")}</li>
                </ul>
              </section>

              <section className="rounded-xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]" aria-labelledby="recent-title">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 id="recent-title" className="text-[16px] font-bold text-slate-900 dark:text-white">{t("workspace.detect.recentTitle")}</h2>
                    <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{t("workspace.detect.recentSubtitle")}</p>
                  </div>
                  <button type="button" onClick={() => navigate("/history")} className="text-[12px] font-bold text-primary hover:underline">{t("workspace.topbar.viewAll")}</button>
                </div>

                {recentLoading ? (
                  <div className="mt-4 space-y-3" aria-label="Đang tải lịch sử">
                    {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />)}
                  </div>
                ) : recentResults.length === 0 ? (
                  <div className="mt-5 rounded-xl bg-muted/60 p-4 text-center">
                    <FileImage className="mx-auto h-5 w-5 text-slate-400" />
                    <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">{t("workspace.detect.noRecent")}</p>
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-border">
                    {recentResults.slice(0, 4).map((result) => {
                      const risky = isRiskyPrediction(result.resultLabel || "");
                      const resultType = result.fileName.split(".").pop() || "";
                      return (
                        <button
                          key={result.detectionResultId}
                          type="button"
                          onClick={() => openHistoricalResult(result)}
                          className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${risky ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"}`}>
                            <FileTypeIcon type={resultType} className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100">{result.fileName}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              {risky ? t("workspace.history.suspicious") : t("workspace.history.authentic")} <Clock className="h-3 w-3" /> {formatRelativeTime(result.processedAt, activeI18n.resolvedLanguage || "vi")}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ResultSummary({
  fileName,
  riskScore,
  confidence,
  risky,
  trusted,
  onOpen,
  onReset,
  onDownload,
}: {
  fileName: string;
  riskScore: number;
  confidence: number;
  risky: boolean;
  trusted: boolean;
  onOpen: () => void;
  onReset: () => void;
  onDownload: () => void;
}) {
  const { t } = useTranslation();
  const tone = risky
    ? "border-red-200 bg-red-50/65 dark:border-red-500/25 dark:bg-red-500/[0.08]"
    : trusted
      ? "border-emerald-200 bg-emerald-50/65 dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]"
      : "border-amber-200 bg-amber-50/65 dark:border-amber-500/25 dark:bg-amber-500/[0.08]";
  const iconTone = risky
    ? "bg-red-500/12 text-red-600 dark:text-red-400"
    : trusted
      ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
      : "bg-amber-500/12 text-amber-700 dark:text-amber-400";

  return (
    <div className={`rounded-xl border p-5 ${tone}`} aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-xl ${iconTone}`}>
            {risky ? <AlertTriangle className="h-5 w-5" /> : trusted ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-[15px] font-bold text-slate-900 dark:text-white">
              {risky ? t("workspace.detect.riskyContent") : trusted ? t("workspace.detect.trustedContent") : t("workspace.detect.reviewContent")}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
              {risky
                ? t("workspace.detect.riskySummary", { score: riskScore })
                : trusted
                  ? t("workspace.detect.trustedSummary")
                  : t("workspace.detect.reviewSummary")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground hover:bg-[#406dcc]">
            {t("workspace.detect.viewResult")} <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={onDownload} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-muted dark:text-slate-300">
            <Download className="h-3.5 w-3.5" /> {t("workspace.detect.downloadReport")}
          </button>
          <button type="button" onClick={onReset} className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-muted dark:text-slate-300">
            {t("workspace.detect.checkAnother")}
          </button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/[0.06] pt-4 text-[12px] text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5"><FileCheck2 className="h-3.5 w-3.5" /> {fileName}</span>
        <span>{t("workspace.detect.riskDetected", { score: riskScore })}</span>
        <span>{t("workspace.detect.confidence", { score: Math.round(confidence * 100) })}</span>
      </div>
    </div>
  );
}
