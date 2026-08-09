import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  FileImage,
  FileText,
  LoaderCircle,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useAuth } from "../../auth/context/AuthContext";
import { useCredits } from "../../billing/hooks/useCredits";
import { downloadScanReportPdf } from "../api/reportApi";

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
}

function isRiskyPrediction(prediction: string) {
  return ["AI_GENERATED", "AI_GENERATED_AND_DEEPFAKE", "AI_GENERATED_AUDIO", "DEEPFAKE", "FAKE"].includes(
    prediction.toUpperCase(),
  );
}

function isTrustedPrediction(prediction: string) {
  return ["REAL", "AUTHENTIC", "HUMAN"].includes(prediction.toUpperCase());
}

function asPercent(value: number | undefined) {
  return `${Math.max(0, Math.min(100, Math.round((value ?? 0) * 100)))}%`;
}

function formatFileSize(bytes: number | undefined) {
  if (!bytes) return "Không rõ dung lượng";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();
  const { credits } = useCredits();
  const [detection, setDetection] = useState<DetectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const routeState = location.state as DetectionData | null;
    if (routeState?.prediction) {
      setDetection(routeState);
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem("lastDetection");
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as DetectionData;
      if (parsed.prediction) setDetection(parsed);
    } catch {
      localStorage.removeItem("lastDetection");
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  const downloadPdf = async () => {
    if (!detection?.scanJobId || !accessToken) {
      toast.error("Báo cáo PDF chưa sẵn sàng. Hãy thử lại sau ít phút.");
      return;
    }
    setDownloading(true);
    try {
      await downloadScanReportPdf(
        detection.scanJobId,
        accessToken,
        `deepguard-report-${detection.scanJobId}.pdf`,
      );
      toast.success("Đã tải báo cáo PDF.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải báo cáo PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const copySummary = async () => {
    if (!detection) return;
    const risky = isRiskyPrediction(detection.prediction);
    const trusted = isTrustedPrediction(detection.prediction);
    const status = risky ? "Có dấu hiệu nội dung nhân tạo" : trusted ? "Nội dung có vẻ đáng tin cậy" : "Cần xem lại nội dung";
    try {
      await navigator.clipboard.writeText(
        `Kết quả DeepGuard\nTệp: ${detection.fileName || "Không rõ tên tệp"}\nKết luận: ${status}\nMức rủi ro: ${asPercent(detection.fakeProbability)}\nĐộ tin cậy: ${asPercent(detection.realProbability)}`,
      );
      toast.success("Đã sao chép phần tóm tắt.");
    } catch {
      toast.error("Không thể sao chép. Hãy thử lại.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-primary" />
            <p className="mt-3 text-[14px] text-slate-500 dark:text-slate-400">Đang chuẩn bị kết quả…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!detection) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-background px-5">
          <section className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm shadow-slate-900/[0.04]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary"><FileImage className="h-6 w-6" /></span>
            <h1 className="mt-5 text-xl font-bold tracking-[-0.025em] text-slate-900 dark:text-white">Chưa có kết quả để hiển thị</h1>
            <p className="mt-2 text-[14px] leading-6 text-slate-500 dark:text-slate-400">Tải ảnh, video hoặc âm thanh để DeepGuard bắt đầu kiểm tra.</p>
            <button type="button" onClick={() => navigate("/detect")} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground hover:bg-[#406dcc]"><ScanSearch className="h-4 w-4" /> Kiểm tra nội dung</button>
          </section>
        </div>
      </DashboardLayout>
    );
  }

  const risky = isRiskyPrediction(detection.prediction);
  const trusted = isTrustedPrediction(detection.prediction);
  const verdict = risky
    ? { title: "Có dấu hiệu nội dung nhân tạo", detail: `Hệ thống ghi nhận mức rủi ro ${asPercent(detection.fakeProbability)}. Hãy xem lại nguồn gốc trước khi đăng, chia sẻ hoặc dùng trong giao dịch.`, icon: AlertTriangle, tone: "red" }
    : trusted
      ? { title: "Nội dung có vẻ đáng tin cậy", detail: "Hệ thống chưa phát hiện dấu hiệu can thiệp đáng kể trong lần kiểm tra này. Bạn vẫn nên đối chiếu nguồn gốc nếu nội dung quan trọng.", icon: CheckCircle2, tone: "green" }
      : { title: "Cần xem lại nội dung", detail: "Kết quả chưa đủ chắc chắn để đưa ra kết luận. Hãy đối chiếu với nguồn gốc hoặc thử lại bằng tệp rõ nét hơn.", icon: CircleHelp, tone: "amber" };
  const VerdictIcon = verdict.icon;
  const statusClasses = verdict.tone === "red"
    ? "border-red-200 bg-red-50/70 dark:border-red-500/25 dark:bg-red-500/[0.08]"
    : verdict.tone === "green"
      ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]"
      : "border-amber-200 bg-amber-50/70 dark:border-amber-500/25 dark:bg-amber-500/[0.08]";
  const iconClasses = verdict.tone === "red"
    ? "bg-red-500/12 text-red-600 dark:text-red-400"
    : verdict.tone === "green"
      ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
      : "bg-amber-500/12 text-amber-700 dark:text-amber-400";

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">DeepGuard kết quả</p>
              <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">Kết quả kiểm tra</h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-600 dark:text-slate-300">Kết luận dưới đây giúp bạn sàng lọc nội dung nhanh hơn trước khi sử dụng.</p>
            </div>
            <button type="button" onClick={() => navigate("/detect")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm shadow-blue-500/25 hover:bg-[#406dcc]"><ScanSearch className="h-4 w-4" /> Kiểm tra tệp khác</button>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]" aria-labelledby="verdict-title">
              <div className="p-5 sm:p-7">
                <div className={`rounded-xl border p-5 ${statusClasses}`}>
                  <div className="flex gap-4">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${iconClasses}`}><VerdictIcon className="h-6 w-6" /></span>
                    <div>
                      <p className="text-[18px] font-bold tracking-[-0.02em] text-slate-900 dark:text-white" id="verdict-title">{verdict.title}</p>
                      <p className="mt-1.5 text-[14px] leading-6 text-slate-600 dark:text-slate-300">{verdict.detail}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-muted/45 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Mức rủi ro</p>
                    <p className={`mt-2 text-2xl font-bold tracking-[-0.03em] ${risky ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-white"}`}>{asPercent(detection.fakeProbability)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/45 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Độ tin cậy</p>
                    <p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-emerald-700 dark:text-emerald-400">{asPercent(detection.realProbability)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/45 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Phân loại hệ thống</p>
                    <p className="mt-2 text-[15px] font-bold text-slate-800 dark:text-white">{risky ? "Cần xác minh" : trusted ? "Có vẻ thật" : "Chưa chắc chắn"}</p>
                  </div>
                </div>

                {detection.imageUrl && (
                  <div className="mt-7 overflow-hidden rounded-xl border border-border bg-muted/35">
                    <div className="flex items-center gap-2 border-b border-border px-4 py-3"><FileImage className="h-4 w-4 text-primary" /><span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Tệp đã kiểm tra</span></div>
                    <img src={detection.imageUrl} alt={detection.fileName || "Nội dung đã kiểm tra"} className="max-h-[400px] w-full object-contain" />
                  </div>
                )}

                <div className="mt-7 rounded-xl border border-border">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3"><FileText className="h-4 w-4 text-slate-500" /><h2 className="text-[13px] font-bold text-slate-800 dark:text-slate-100">Thông tin tệp</h2></div>
                  <dl className="grid gap-x-4 gap-y-4 p-4 text-[13px] sm:grid-cols-2">
                    <div><dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500 dark:text-slate-400">Tên tệp</dt><dd className="mt-1 truncate font-semibold text-slate-800 dark:text-slate-100">{detection.fileName || "Không rõ tên tệp"}</dd></div>
                    <div><dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500 dark:text-slate-400">Dung lượng</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatFileSize(detection.fileSize)}</dd></div>
                    <div><dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500 dark:text-slate-400">Thời điểm kiểm tra</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{detection.uploadedAt ? new Date(detection.uploadedAt).toLocaleString("vi-VN") : "Vừa hoàn tất"}</dd></div>
                    <div><dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500 dark:text-slate-400">Mã kiểm tra</dt><dd className="mt-1 truncate font-semibold text-slate-800 dark:text-slate-100">{detection.scanJobId || detection.detectionResultId || "Đang cập nhật"}</dd></div>
                  </dl>
                </div>

                {detection.message && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-5 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300">{detection.message}</p>}
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]" aria-labelledby="next-step-title">
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h2 id="next-step-title" className="text-[16px] font-bold text-slate-900 dark:text-white">Nên làm gì tiếp?</h2></div>
                <ol className="mt-4 space-y-4">
                  {(risky
                    ? ["Tạm dừng đăng hoặc chia sẻ nội dung này.", "Đối chiếu với nguồn gốc hoặc người gửi đáng tin cậy.", "Lưu báo cáo nếu bạn cần trao đổi với đối tác."]
                    : trusted
                      ? ["Đối chiếu nguồn gốc nếu nội dung phục vụ giao dịch quan trọng.", "Lưu báo cáo để theo dõi nội bộ khi cần.", "Kiểm tra tệp khác nếu bạn còn nghi ngờ."]
                      : ["Thử lại với bản gốc có chất lượng cao hơn.", "So sánh với nguồn nội dung ban đầu.", "Liên hệ hỗ trợ nếu bạn cần tư vấn thêm."]
                  ).map((item, index) => <li key={item} className="flex gap-3 text-[13px] leading-5 text-slate-600 dark:text-slate-300"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{index + 1}</span>{item}</li>)}
                </ol>
              </section>

              {credits && <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-5"><p className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Tín dụng còn lại</p><p className="mt-1 text-3xl font-bold tracking-[-0.035em] text-primary">{credits.remainingCredits}</p><p className="mt-2 text-[12px] leading-5 text-slate-500 dark:text-slate-400">Bạn có thể bắt đầu một lượt kiểm tra mới bất cứ lúc nào.</p></section>}

              <section className="rounded-2xl border border-border bg-card p-3 shadow-sm shadow-slate-900/[0.03]">
                <button type="button" onClick={copySummary} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-slate-700 transition-colors hover:bg-muted dark:text-slate-200"><Copy className="h-4 w-4 text-primary" /> Sao chép tóm tắt</button>
                <button type="button" onClick={downloadPdf} disabled={downloading || !detection.scanJobId} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-slate-700 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200">{downloading ? <LoaderCircle className="h-4 w-4 animate-spin text-primary" /> : <Download className="h-4 w-4 text-primary" />}{downloading ? "Đang chuẩn bị báo cáo" : "Tải báo cáo PDF"}</button>
                <button type="button" onClick={() => navigate("/history")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-slate-700 transition-colors hover:bg-muted dark:text-slate-200"><ChevronRight className="h-4 w-4 text-primary" /> Xem lịch sử kiểm tra</button>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
