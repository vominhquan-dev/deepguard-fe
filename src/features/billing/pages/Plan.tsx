import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  CheckCircle,
  CircleAlert,
  Clock,
  CreditCard,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useAuth } from "../../auth/context/AuthContext";
import { useCredits } from "../hooks/useCredits";
import { getMyPayments, type PaymentListItem } from "../api/paymentsApi";
import {
  getCurrentSubscription,
  type CurrentSubscriptionData,
} from "../api/subscriptionApi";

interface PlanConfig {
  id: string;
  pricingPlanId: string;
  name: string;
  duration: string;
  price: string;
  originalPrice?: string;
  saving?: string;
  credits: string;
  icon: typeof Sparkles;
  highlighted?: boolean;
  features: string[];
}

// These ids are the backend's contract. Do not replace them with display names.
const plans: PlanConfig[] = [
  {
    id: "free",
    pricingPlanId: "FREE",
    name: "Miễn phí",
    duration: "Dùng lâu dài",
    price: "0đ",
    credits: "5 tín dụng mỗi ngày",
    icon: Sparkles,
    features: [
      "Kiểm tra ảnh cơ bản",
      "5 tín dụng mỗi ngày",
      "Hỗ trợ qua cộng đồng",
    ],
  },
  {
    id: "premium-1m",
    pricingPlanId: "PREMIUM_1M",
    name: "Tiêu chuẩn",
    duration: "1 tháng",
    price: "99.000đ",
    originalPrice: "199.000đ",
    credits: "500 tín dụng mỗi tháng",
    icon: Star,
    highlighted: true,
    features: [
      "Kiểm tra ảnh và âm thanh",
      "Xử lý ưu tiên",
      "Hỗ trợ qua email",
    ],
  },
  {
    id: "premium-3m",
    pricingPlanId: "PREMIUM_3M",
    name: "Chuyên nghiệp",
    duration: "3 tháng",
    price: "539.000đ",
    originalPrice: "597.000đ",
    saving: "Tiết kiệm 10%",
    credits: "500 tín dụng mỗi tháng",
    icon: Zap,
    features: [
      "Kiểm tra ảnh, video và âm thanh",
      "Báo cáo PDF",
      "Ưu tiên hỗ trợ",
    ],
  },
  {
    id: "premium-6m",
    pricingPlanId: "PREMIUM_6M",
    name: "Doanh nghiệp nhỏ",
    duration: "6 tháng",
    price: "1.019.000đ",
    originalPrice: "1.194.000đ",
    saving: "Tiết kiệm 15%",
    credits: "833 tín dụng mỗi tháng",
    icon: ShieldCheck,
    features: [
      "Mọi loại nội dung",
      "Báo cáo PDF và quyền truy cập API",
      "Hỗ trợ ưu tiên",
    ],
  },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "Không giới hạn";
  const normalized = value.replace(" ", "T");
  const [datePart, timePart] = normalized.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart ? timePart.split(":").map(Number) : [0, 0];
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const gmt7 = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  return `${String(gmt7.getUTCDate()).padStart(2, "0")}/${String(gmt7.getUTCMonth() + 1).padStart(2, "0")}/${gmt7.getUTCFullYear()}`;
}

function formatPaymentDate(value: string) {
  if (!value) return "—";
  const normalized = value.replace(" ", "T");
  const [datePart, timePart] = normalized.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart ? timePart.split(":").map(Number) : [0, 0];
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const gmt7 = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  return `${String(gmt7.getUTCHours()).padStart(2, "0")}:${String(gmt7.getUTCMinutes()).padStart(2, "0")} ${String(gmt7.getUTCDate()).padStart(2, "0")}/${String(gmt7.getUTCMonth() + 1).padStart(2, "0")}/${gmt7.getUTCFullYear()}`;
}

function getPaymentStatus(status: string) {
  switch (status) {
    case "COMPLETED":
    case "SUCCESS":
      return {
        label: status === "SUCCESS" ? "Thành công" : "Hoàn tất",
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        icon: CheckCircle,
      };
    case "PENDING":
      return {
        label: "Đang chờ",
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        icon: Clock,
      };
    case "FAILED":
      return {
        label: "Thất bại",
        color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        icon: AlertCircle,
      };
    case "EXPIRED":
    case "CANCELLED":
      return {
        label: status === "EXPIRED" ? "Đã hết hạn" : "Đã huỷ",
        color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
        icon: AlertCircle,
      };
    default:
      return {
        label: status,
        color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
        icon: Clock,
      };
  }
}

export function Plan() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [subscription, setSubscription] = useState<CurrentSubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [choosingPlan, setChoosingPlan] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    if (!accessToken) {
      setSubscription(null);
      setSubscriptionError("Phiên đăng nhập không còn hợp lệ. Hãy đăng nhập lại.");
      setLoadingSubscription(false);
      return;
    }

    setLoadingSubscription(true);
    setSubscriptionError(null);
    try {
      setSubscription(await getCurrentSubscription(accessToken));
    } catch (error) {
      setSubscriptionError(
        error instanceof Error ? error.message : "Không thể tải thông tin gói hiện tại.",
      );
    } finally {
      setLoadingSubscription(false);
    }
  }, [accessToken]);

  const loadPayments = useCallback(async () => {
    if (!accessToken) {
      setPayments([]);
      setPaymentsLoading(false);
      return;
    }

    setPaymentsLoading(true);
    try {
      const response = await getMyPayments(accessToken);
      if (response.success) setPayments(response.data);
    } catch {
      // Keep the billing page usable even when the history endpoint is unavailable.
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    const reloadWhenVisible = () => {
      if (document.visibilityState === "visible") {
        loadSubscription();
        loadPayments();
      }
    };
    document.addEventListener("visibilitychange", reloadWhenVisible);
    return () => document.removeEventListener("visibilitychange", reloadWhenVisible);
  }, [loadPayments, loadSubscription]);

  const activePlanId = subscription?.pricingPlanId;
  const currentPlan = plans.find((plan) => plan.pricingPlanId === activePlanId);
  const currentPlanName = currentPlan?.name || subscription?.pricingPlanName || "Đang tải";
  const usedCredits = credits?.usedCredits ?? 0;
  const remainingCredits = credits?.remainingCredits ?? 0;
  const totalCredits = usedCredits + remainingCredits;
  const usedPercent = totalCredits > 0 ? Math.min(100, Math.round((usedCredits / totalCredits) * 100)) : 0;

  const choosePlan = (plan: PlanConfig) => {
    if (loadingSubscription) return;
    if (subscriptionError) {
      toast.error("Hãy tải lại thông tin gói trước khi tiếp tục thanh toán.");
      return;
    }
    if (plan.pricingPlanId === activePlanId) {
      toast.info("Đây là gói bạn đang sử dụng.");
      return;
    }

    setChoosingPlan(plan.id);
    try {
      // Preserve the existing SePay routing contract.
      navigate(`/payment/sepay/${plan.pricingPlanId}`);
    } finally {
      setChoosingPlan(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <header className="max-w-2xl">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">DeepGuard tài khoản</p>
            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">Gói và thanh toán</h1>
            <p className="mt-2 text-[14px] leading-6 text-slate-600 dark:text-slate-300">Chọn lượng tín dụng phù hợp với nhịp kiểm tra nội dung của cửa hàng bạn.</p>
          </header>

          {subscriptionError ? (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/25 dark:bg-amber-500/[0.08]">
              <p className="flex items-center gap-2 text-[13px] text-amber-800 dark:text-amber-300"><CircleAlert className="h-4 w-4 shrink-0" />{subscriptionError}</p>
              <button type="button" onClick={loadSubscription} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"><RefreshCw className="h-3.5 w-3.5" /> Tải lại</button>
            </div>
          ) : (
            <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]" aria-labelledby="current-plan-title">
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><CreditCard className="h-5 w-5" /></span>
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-[0.09em] text-primary">Gói hiện tại</p>
                        <h2 id="current-plan-title" className="mt-1 text-[20px] font-bold tracking-[-0.025em] text-slate-900 dark:text-white">{loadingSubscription ? "Đang tải thông tin gói…" : currentPlanName}</h2>
                        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{loadingSubscription ? "" : subscription?.status === "ACTIVE" ? `Hiệu lực đến ${formatDate(subscription.endDate)}` : "Gói dùng miễn phí, không cần gia hạn."}</p>
                      </div>
                    </div>
                    {!loadingSubscription && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Đang hoạt động</span>}
                  </div>

                  <div className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
                    <div className="flex items-center justify-between gap-4"><p className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-100"><Zap className="h-4 w-4 text-primary" /> Tín dụng đã dùng</p><span className="text-[13px] font-bold text-primary">{creditsLoading ? "…" : `${usedCredits} / ${totalCredits}`}</span></div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${usedPercent}%` }} /></div>
                    <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">Còn lại {creditsLoading ? "…" : remainingCredits} tín dụng. Số liệu được cập nhật từ tài khoản của bạn.</p>
                  </div>
                </div>
                <div className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    { label: "Tín dụng còn lại", value: creditsLoading ? "…" : remainingCredits },
                    { label: "Đã sử dụng", value: creditsLoading ? "…" : usedCredits },
                    { label: "Ngày hết hạn", value: loadingSubscription ? "…" : formatDate(subscription?.endDate) },
                  ].map((item) => <div key={item.label} className="rounded-xl border border-border bg-muted/45 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{item.label}</p><p className="mt-1 text-[16px] font-bold text-slate-800 dark:text-white">{item.value}</p></div>)}
                </div>
              </div>
            </section>
          )}

          <section className="mt-9" aria-labelledby="plans-title">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="plans-title" className="text-xl font-bold tracking-[-0.025em] text-slate-900 dark:text-white">Chọn gói phù hợp</h2><p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Giá minh bạch, thanh toán bảo mật qua SePay.</p></div><p className="text-[12px] text-slate-500 dark:text-slate-400">Bạn có thể nâng cấp bất cứ khi nào cần.</p></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const current = plan.pricingPlanId === activePlanId;
                return (
                  <article key={plan.id} className={`relative flex min-h-[420px] flex-col rounded-xl border bg-card p-5 shadow-sm shadow-slate-900/[0.03] ${current ? "border-primary ring-1 ring-primary/25" : plan.highlighted ? "border-primary/45" : "border-border"}`}>
                    {plan.highlighted && !current && <span className="absolute -top-3 left-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">Được chọn nhiều</span>}
                    {current && <span className="absolute -top-3 right-4 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">Đang dùng</span>}
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${current || plan.highlighted ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}><Icon className="h-5 w-5" /></span>
                    <div className="mt-4"><h3 className="text-[18px] font-bold text-slate-900 dark:text-white">{plan.name}</h3><p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{plan.duration}</p></div>
                    <div className="mt-5"><div className="flex flex-wrap items-baseline gap-x-2"><p className="text-2xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">{plan.price}</p>{plan.originalPrice && <span className="text-[12px] text-slate-400 line-through">{plan.originalPrice}</span>}</div>{plan.saving && <span className="mt-2 inline-flex rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{plan.saving}</span>}<p className="mt-2 text-[12px] font-bold text-primary">{plan.credits}</p></div>
                    <ul className="mt-5 space-y-2.5 border-t border-border pt-5">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-[12px] leading-5 text-slate-600 dark:text-slate-300"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{feature}</li>)}</ul>
                    <button type="button" onClick={() => choosePlan(plan)} disabled={current || loadingSubscription || Boolean(subscriptionError) || choosingPlan === plan.id} className={`mt-auto w-full rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${current ? "bg-secondary text-secondary-foreground" : plan.highlighted ? "bg-primary text-primary-foreground hover:bg-[#406dcc]" : "border border-border bg-card text-slate-700 hover:bg-muted dark:text-slate-200"}`}>{choosingPlan === plan.id ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Đang chuyển…</span> : current ? "Gói hiện tại" : loadingSubscription ? "Đang kiểm tra…" : "Chọn gói này"}</button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]"><div><h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Cần hoá đơn hoặc hỗ trợ thanh toán?</h2><p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Đội ngũ DeepGuard sẵn sàng hỗ trợ bạn qua kênh liên hệ.</p></div><button type="button" onClick={() => navigate("/contact")} className="rounded-lg border border-border px-4 py-2.5 text-[13px] font-bold text-primary hover:bg-primary/[0.035]">Liên hệ hỗ trợ</button></section>

          <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]" aria-labelledby="billing-history-title">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6"><div><h2 id="billing-history-title" className="text-[16px] font-bold text-slate-900 dark:text-white">Lịch sử thanh toán</h2><p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Các giao dịch và hoá đơn của tài khoản.</p></div><button type="button" onClick={loadPayments} disabled={paymentsLoading} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold text-primary transition-colors hover:bg-primary/[0.035] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${paymentsLoading ? "animate-spin" : ""}`} /> Làm mới</button></div>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-12"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center"><CreditCard className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-[14px] text-slate-500 dark:text-slate-400">Chưa có lịch sử thanh toán</p><p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">Hoá đơn và biên lai sẽ xuất hiện tại đây sau lần mua đầu tiên.</p></div>
            ) : (
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-muted/45"><tr className="text-[11px] font-bold uppercase tracking-[0.07em] text-slate-500 dark:text-slate-400"><th className="px-5 py-3 sm:px-6">Ngày</th><th className="px-3 py-3">Giao dịch</th><th className="px-3 py-3">Gói</th><th className="px-3 py-3">Số tiền</th><th className="px-3 py-3">Tín dụng</th><th className="px-3 py-3">Trạng thái</th><th className="px-5 py-3 text-right sm:px-6">Chi tiết</th></tr></thead><tbody>{payments.map((payment) => { const badge = getPaymentStatus(payment.status); const StatusIcon = badge.icon; return <tr key={payment.paymentId} className="border-t border-border text-[13px] text-slate-600 transition-colors hover:bg-muted/35 dark:text-slate-300"><td className="px-5 py-3.5 sm:px-6">{formatPaymentDate(payment.createdAt)}</td><td className="px-3 py-3.5 font-mono text-[12px]">{payment.transactionCode}</td><td className="px-3 py-3.5">{payment.pricingPlanName}</td><td className="px-3 py-3.5 font-semibold text-slate-900 dark:text-white">{payment.amount.toLocaleString("vi-VN")}đ</td><td className="px-3 py-3.5">{payment.credits}</td><td className="px-3 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.color}`}><StatusIcon className="h-3 w-3" />{badge.label}</span></td><td className="px-5 py-3.5 text-right sm:px-6"><button type="button" onClick={() => navigate(`/payment/sepay/${payment.pricingPlanId}`)} className="font-semibold text-primary hover:underline">Xem</button></td></tr>; })}</tbody></table></div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
