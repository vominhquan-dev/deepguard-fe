import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  Landmark,
  Loader2,
  QrCode,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useAuth } from "../../auth/context/AuthContext";
import { createSePayPayment, type SePayPaymentData } from "../api/sepayApi";

export function SePayPayment() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { accessToken } = useAuth();
  const [payment, setPayment] = useState<SePayPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError("Không tìm thấy gói cần thanh toán.");
      setLoading(false);
      return;
    }
    if (!accessToken) {
      setError("Phiên đăng nhập đã hết. Hãy đăng nhập lại để thanh toán.");
      setLoading(false);
      return;
    }
    const initPayment = async () => {
      try {
        const response = await createSePayPayment(
          { pricingPlanId: planId },
          accessToken,
        );
        if (!response.success)
          throw new Error(
            response.message || "Không thể tạo yêu cầu thanh toán.",
          );
        setPayment(response.data);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Không thể tạo yêu cầu thanh toán.",
        );
      } finally {
        setLoading(false);
      }
    };
    void initPayment();
  }, [accessToken, planId]);

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast.success(`Đã sao chép ${label.toLowerCase()}.`);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error("Không thể sao chép. Hãy chọn và sao chép thủ công.");
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="grid min-h-[60vh] place-items-center p-6">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-[14px] text-slate-500 dark:text-slate-400">
              Đang tạo mã thanh toán an toàn…
            </p>
          </div>
        </div>
      </DashboardLayout>
    );

  if (error || !payment)
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-xl p-5 sm:p-8">
          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại gói dịch vụ
          </button>
          <div className="mt-14 rounded-2xl border border-border bg-card p-7 text-center shadow-sm">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-rose-200 text-rose-600">
              <CircleAlert className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              Không thể tạo thanh toán
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-slate-500 dark:text-slate-400">
              {error || "Vui lòng thử lại sau."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="mt-6 h-10 rounded-lg bg-primary px-5 text-[13px] font-bold text-primary-foreground hover:bg-[#406dcc]"
            >
              Chọn lại gói
            </button>
          </div>
        </div>
      </DashboardLayout>
    );

  const amount = `${payment.amount.toLocaleString("vi-VN")}₫`;
  const qrLink = `https://img.vietqr.io/image/${payment.bankCode}-${payment.bankAccountNo}-compact2.png?amount=${payment.amount}&addInfo=${encodeURIComponent(payment.transferContent)}&accountName=${encodeURIComponent(payment.bankAccountName)}`;
  const CopyButton = ({ label, value }: { label: string; value: string }) => (
    <button
      type="button"
      onClick={() => copyValue(label, value)}
      className="grid h-8 w-8 place-items-center rounded-md text-primary transition-colors hover:bg-primary/10"
      aria-label={`Sao chép ${label}`}
    >
      {copied === label ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <DashboardLayout>
      <main className="mx-auto max-w-5xl p-5 sm:p-8">
        <button
          type="button"
          onClick={() => navigate("/plan")}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại gói dịch vụ
        </button>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-primary">
              Thanh toán qua VietQR
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white">
              Hoàn tất nâng cấp
            </h1>
            <p className="mt-2 text-[14px] text-slate-500 dark:text-slate-400">
              Quét mã hoặc chuyển khoản với đúng số tiền và nội dung bên dưới.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 px-3 py-1.5 text-[12px] font-bold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Đang chờ
            thanh toán
          </span>
        </div>
        <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03] lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)] sm:p-7">
          <div className="flex flex-col items-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <QrCode className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-[15px] font-bold text-slate-900 dark:text-white">
              Quét mã thanh toán
            </h2>
            <p className="mt-1 text-center text-[12px] leading-5 text-slate-500 dark:text-slate-400">
              Mở ứng dụng ngân hàng và quét QR để điền sẵn thông tin.
            </p>
            <div className="mt-5 rounded-2xl border border-border bg-white p-3 shadow-sm">
              <img
                src={payment.qrUrl}
                alt={`Mã VietQR thanh toán ${amount}`}
                className="h-64 w-64 object-contain sm:h-72 sm:w-72"
              />
            </div>
            <a
              href={qrLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[13px] font-bold text-primary-foreground transition-colors hover:bg-[#406dcc]"
            >
              <ExternalLink className="h-4 w-4" /> Mở mã QR
            </a>
          </div>
          <div className="min-w-0">
            <div className="rounded-xl border border-border bg-muted/60 p-5">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-primary" />
                <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
                  Thông tin đơn hàng
                </h2>
              </div>
              <dl className="mt-4 space-y-3 text-[13px]">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Gói dịch vụ
                  </dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {payment.planName}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Tín dụng
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {payment.credits.toLocaleString("vi-VN")}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                  <dt className="font-semibold text-slate-700 dark:text-slate-200">
                    Tổng thanh toán
                  </dt>
                  <dd className="text-xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                    {amount}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-5">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
                  Thông tin chuyển khoản
                </h2>
              </div>
              <dl className="mt-4 divide-y divide-primary/10">
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[12px] text-slate-500 dark:text-slate-400">
                    Ngân hàng
                  </dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {payment.bankCode}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[12px] text-slate-500 dark:text-slate-400">
                    Số tài khoản
                  </dt>
                  <dd className="flex min-w-0 items-center gap-1">
                    <span className="truncate font-bold text-slate-900 dark:text-white">
                      {payment.bankAccountNo}
                    </span>
                    <CopyButton
                      label="Số tài khoản"
                      value={payment.bankAccountNo}
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[12px] text-slate-500 dark:text-slate-400">
                    Chủ tài khoản
                  </dt>
                  <dd className="text-right font-bold text-slate-900 dark:text-white">
                    {payment.bankAccountName}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[12px] text-slate-500 dark:text-slate-400">
                    Nội dung
                  </dt>
                  <dd className="flex min-w-0 items-center gap-1">
                    <span className="truncate font-bold text-primary">
                      {payment.transferContent}
                    </span>
                    <CopyButton
                      label="Nội dung chuyển khoản"
                      value={payment.transferContent}
                    />
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 rounded-xl border border-border p-4">
              <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                Lưu ý trước khi chuyển khoản
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
                <li>
                  Chuyển đúng số tiền{" "}
                  <strong className="text-slate-700 dark:text-slate-200">
                    {amount}
                  </strong>
                  .
                </li>
                <li>Giữ nguyên nội dung chuyển khoản để hệ thống đối chiếu.</li>
                <li>
                  Tín dụng sẽ được cập nhật sau khi hệ thống xác nhận giao dịch.
                </li>
              </ol>
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
