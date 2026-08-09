import { ChangeEvent, DragEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileImage,
  FileText,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  Mic,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Upload,
  Video,
  Volume2,
  X,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useMediaUpload } from "../../detection/hooks/useMediaUpload";
import { useDetectionResults } from "../../detection/hooks/useDetectionResults";
import { useAuth } from "../../auth/context/AuthContext";

type UploadState = "idle" | "selected" | "scanning" | "done" | "error";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const supportedFormats = ["JPG", "PNG", "WEBP", "MP4", "MOV", "AVI", "MP3", "WAV", "M4A"];

function isRiskyPrediction(prediction: string) {
  return ["AI_GENERATED", "AI_GENERATED_AND_DEEPFAKE", "AI_GENERATED_AUDIO", "DEEPFAKE", "FAKE"].includes(
    prediction.toUpperCase(),
  );
}

function isTrustedPrediction(prediction: string) {
  return ["REAL", "AUTHENTIC", "HUMAN"].includes(prediction.toUpperCase());
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function FileTypeIcon({ type, className = "" }: { type: string; className?: string }) {
  if (type.startsWith("image") || type === "IMAGE") return <ImageIcon className={className} />;
  if (type.startsWith("video") || type === "VIDEO") return <Video className={className} />;
  if (type.startsWith("audio") || type === "AUDIO") return <Mic className={className} />;
  return <FileText className={className} />;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { upload, uploading, progress, data, detection, error: uploadError, reset } = useMediaUpload();
  const { results: recentResults, loading: recentLoading } = useDetectionResults();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile?.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!uploadError) return;
    setLocalError(uploadError);
    setUploadState("error");
  }, [uploadError]);

  const resetUpload = () => {
    reset();
    setSelectedFile(null);
    setLocalError(null);
    setUploadState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setLocalError("Tệp lớn hơn giới hạn 100 MB. Hãy nén hoặc cắt ngắn tệp trước khi thử lại.");
      setUploadState("error");
      return;
    }
    if (!/(image|video|audio)\//.test(file.type)) {
      setLocalError("Định dạng này chưa được hỗ trợ. Hãy chọn ảnh, video hoặc âm thanh hợp lệ.");
      setUploadState("error");
      return;
    }
    setSelectedFile(file);
    setLocalError(null);
    setUploadState("selected");
  };

  const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) selectFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) selectFile(file);
  };

  const openFilePicker = (accept = "image/*,video/*,audio/*") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleDropZoneKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  const startScan = async () => {
    if (!selectedFile) return;
    if (!accessToken) {
      setLocalError("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại để tiếp tục.");
      setUploadState("error");
      return;
    }

    setUploadState("scanning");
    setLocalError(null);
    try {
      const uploadData = await upload(selectedFile, accessToken);
      const result = uploadData.detection;
      if (result) {
        const fakeProbability = Math.max(
          result.aiGeneratedScore ?? 0,
          result.deepfakeScore ?? 0,
          result.aiGeneratedAudioScore ?? 0,
        );
        localStorage.setItem(
          "lastDetection",
          JSON.stringify({
            prediction: result.prediction,
            fakeProbability,
            realProbability: result.notAiGeneratedScore ?? result.confidence ?? 0,
            imageUrl: uploadData.originalUrl,
            fileName: uploadData.fileName,
            fileType: uploadData.fileType,
            fileSize: uploadData.fileSize,
            uploadedAt: uploadData.uploadedAt,
            scanJobId: uploadData.id,
            mediaId: uploadData.id,
          }),
        );
        localStorage.setItem("lastUploadData", JSON.stringify(uploadData));
      }
      setUploadState("done");
      toast.success("Đã hoàn tất kiểm tra nội dung.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể kiểm tra tệp này.";
      setLocalError(message);
      setUploadState("error");
      toast.error(message);
    }
  };

  const currentPrediction = detection?.prediction || "";
  const isRisky = currentPrediction && isRiskyPrediction(currentPrediction);
  const isTrusted = currentPrediction && isTrustedPrediction(currentPrediction);
  const riskScore = detection
    ? Math.round(
        Math.max(
          detection.aiGeneratedScore ?? 0,
          detection.deepfakeScore ?? 0,
          detection.aiGeneratedAudioScore ?? 0,
        ) * 100,
      )
    : 0;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <header className="mb-8 max-w-2xl">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">
              DeepGuard kiểm tra nội dung
            </p>
            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">
              Kiểm tra ảnh, video hoặc âm thanh
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-slate-600 dark:text-slate-300">
              Nhận một kết luận rõ ràng để bạn quyết định có nên tiếp tục sử dụng nội dung đó hay không.
            </p>
          </header>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]" aria-labelledby="upload-title">
              <div className="border-b border-border px-5 py-4 sm:px-6">
                <h2 id="upload-title" className="text-[16px] font-bold text-slate-900 dark:text-white">
                  Tải tệp cần kiểm tra
                </h2>
                <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                  Một lượt kiểm tra sẽ được trừ sau khi tệp được gửi thành công.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/*,video/*,audio/*"
                  onChange={onFileInput}
                />

                {(uploadState === "idle" || uploadState === "selected") && (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleDropZoneKey}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => uploadState === "idle" && openFilePicker()}
                    className={`relative min-h-[300px] rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                      dragging
                        ? "border-primary bg-primary/[0.06]"
                        : uploadState === "selected"
                          ? "border-primary/40 bg-primary/[0.035]"
                          : "border-slate-300 bg-slate-50/70 hover:border-primary/60 hover:bg-primary/[0.025] dark:border-slate-600 dark:bg-slate-800/30"
                    }`}
                    aria-label="Khu vực tải tệp"
                  >
                    {uploadState === "idle" ? (
                      <div className="flex min-h-[250px] flex-col items-center justify-center">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                          <Upload className="h-7 w-7" />
                        </span>
                        <h3 className="mt-5 text-[18px] font-bold text-slate-900 dark:text-white">
                          Kéo thả tệp vào đây
                        </h3>
                        <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
                          hoặc nhấn để chọn tệp từ thiết bị của bạn
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                          {supportedFormats.map((format) => (
                            <span key={format} className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                              {format}
                            </span>
                          ))}
                        </div>
                        <p className="mt-5 text-[12px] text-slate-400">Dung lượng tối đa 100 MB</p>
                      </div>
                    ) : (
                      <div className="flex min-h-[250px] flex-col items-center justify-center">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Xem trước tệp đã chọn" className="mb-4 h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200" />
                        ) : (
                          <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                            <FileTypeIcon type={selectedFile?.type || ""} className="h-8 w-8" />
                          </span>
                        )}
                        <p className="max-w-md truncate text-[16px] font-bold text-slate-900 dark:text-white">
                          {selectedFile?.name}
                        </p>
                        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                          {selectedFile && formatFileSize(selectedFile.size)} · Sẵn sàng kiểm tra
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                          <button type="button" onClick={(event) => { event.stopPropagation(); startScan(); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm shadow-blue-500/25 transition-colors hover:bg-[#406dcc]">
                            <ScanSearch className="h-4 w-4" /> Bắt đầu kiểm tra
                          </button>
                          <button type="button" onClick={(event) => { event.stopPropagation(); resetUpload(); }} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-muted dark:text-slate-300">
                            <X className="h-4 w-4" /> Chọn lại
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {uploadState === "scanning" && (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.025] p-6 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <LoaderCircle className="h-7 w-7 animate-spin" />
                    </span>
                    <h3 className="mt-5 text-[18px] font-bold text-slate-900 dark:text-white">
                      {uploading ? "Đang tải tệp an toàn" : "Đang phân tích nội dung"}
                    </h3>
                    <p className="mt-1 max-w-sm text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                      Bạn có thể ở lại trang này. Kết quả sẽ xuất hiện ngay khi sẵn sàng.
                    </p>
                    <div className="mt-6 w-full max-w-sm">
                      <div className="flex justify-between text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                        <span>{selectedFile?.name}</span>
                        <span>{progress?.percentage ?? 0}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress?.percentage ?? 8}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                {uploadState === "done" && detection && data && (
                  <div className={`rounded-xl border p-5 ${isRisky ? "border-red-200 bg-red-50/65 dark:border-red-500/25 dark:bg-red-500/[0.08]" : isTrusted ? "border-emerald-200 bg-emerald-50/65 dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]" : "border-amber-200 bg-amber-50/65 dark:border-amber-500/25 dark:bg-amber-500/[0.08]"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <span className={`grid h-11 w-11 place-items-center rounded-xl ${isRisky ? "bg-red-500/12 text-red-600 dark:text-red-400" : isTrusted ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/12 text-amber-700 dark:text-amber-400"}`}>
                          {isRisky ? <AlertTriangle className="h-5 w-5" /> : isTrusted ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </span>
                        <div>
                          <p className="text-[15px] font-bold text-slate-900 dark:text-white">
                            {isRisky ? "Có dấu hiệu nội dung nhân tạo" : isTrusted ? "Nội dung có vẻ đáng tin cậy" : "Cần xem lại nội dung"}
                          </p>
                          <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                            {isRisky ? `Hệ thống ghi nhận mức rủi ro ${riskScore}%. Hãy kiểm tra kỹ trước khi đăng hoặc chia sẻ.` : isTrusted ? "Hệ thống chưa phát hiện dấu hiệu can thiệp đáng kể trong lần kiểm tra này." : "Kết quả chưa đủ chắc chắn. Hãy đối chiếu thêm với nguồn nội dung gốc."}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => navigate("/results")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground hover:bg-[#406dcc]">
                          Xem kết quả <ChevronRight className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={resetUpload} className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-muted dark:text-slate-300">
                          Kiểm tra tệp khác
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/[0.06] pt-4 text-[12px] text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5"><FileCheck2 className="h-3.5 w-3.5" /> {data.fileName}</span>
                      <span>Rủi ro phát hiện: {riskScore}%</span>
                      <span>Độ tin cậy: {Math.round((detection.confidence ?? 0) * 100)}%</span>
                    </div>
                  </div>
                )}

                {uploadState === "error" && (
                  <div className="rounded-xl border border-red-200 bg-red-50/70 p-5 dark:border-red-500/25 dark:bg-red-500/[0.08]">
                    <div className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/12 text-red-600 dark:text-red-400"><AlertCircle className="h-5 w-5" /></span>
                      <div>
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Không thể xử lý tệp này</h3>
                        <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">{localError || "Đã có lỗi xảy ra trong khi gửi tệp. Hãy thử lại sau ít phút."}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" onClick={resetUpload} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground hover:bg-[#406dcc]"><RefreshCw className="h-3.5 w-3.5" /> Thử lại</button>
                          <button type="button" onClick={() => navigate("/contact")} className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-muted dark:text-slate-300">Liên hệ hỗ trợ</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {uploadState === "idle" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Chọn ảnh", formats: "JPG, PNG, WEBP", icon: ImageIcon, accept: "image/*" },
                      { label: "Chọn video", formats: "MP4, MOV, AVI", icon: Film, accept: "video/*" },
                      { label: "Chọn âm thanh", formats: "MP3, WAV, M4A", icon: Volume2, accept: "audio/*" },
                    ].map(({ label, formats, icon: Icon, accept }) => (
                      <button key={label} type="button" onClick={() => openFilePicker(accept)} className="group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.025]">
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
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]" aria-labelledby="tips-title">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 id="tips-title" className="text-[16px] font-bold text-slate-900 dark:text-white">Lưu ý khi kiểm tra</h2>
                </div>
                <ul className="mt-4 space-y-3 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                  <li className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Tệp tối đa 100 MB; hỗ trợ ảnh, video và âm thanh.</li>
                  <li className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Ảnh hoặc video rõ nét giúp kết quả đáng tin cậy hơn.</li>
                  <li className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Kết quả là tín hiệu hỗ trợ, không thay thế việc đối chiếu nguồn gốc.</li>
                </ul>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]" aria-labelledby="recent-title">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 id="recent-title" className="text-[16px] font-bold text-slate-900 dark:text-white">Kiểm tra gần đây</h2>
                    <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Mở lại một kết quả để xem chi tiết.</p>
                  </div>
                  <button type="button" onClick={() => navigate("/history")} className="text-[12px] font-bold text-primary hover:underline">Tất cả</button>
                </div>

                {recentLoading ? (
                  <div className="mt-4 space-y-3" aria-label="Đang tải lịch sử">
                    {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />)}
                  </div>
                ) : recentResults.length === 0 ? (
                  <div className="mt-5 rounded-xl bg-muted/60 p-4 text-center">
                    <FileImage className="mx-auto h-5 w-5 text-slate-400" />
                    <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">Kết quả gần đây sẽ xuất hiện tại đây.</p>
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-border">
                    {recentResults.slice(0, 4).map((result) => {
                      const risky = isRiskyPrediction(result.resultLabel || "");
                      return (
                        <button
                          key={result.detectionResultId}
                          type="button"
                          onClick={() => navigate("/results", { state: { detectionResultId: result.detectionResultId, scanJobId: result.scanJobId, prediction: result.resultLabel, fakeProbability: result.fakeScore, realProbability: result.confidence, imageUrl: result.originalUrl, fileName: result.fileName, mediaId: result.mediaId, uploadedAt: result.processedAt } })}
                          className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${risky ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"}`}>
                            <FileTypeIcon type={result.fileName} className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100">{result.fileName}</span>
                            <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">{risky ? "Cần xem lại" : "Có vẻ đáng tin cậy"} · {formatRelativeTime(result.processedAt)}</span>
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
