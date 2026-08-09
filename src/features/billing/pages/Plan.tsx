import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Check,
  CircleAlert,
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
import { getCurrentSubscription, type CurrentSubscriptionData } from "../api/subscriptionApi";

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

const plans: PlanConfig[] = [
  {
    id: "free",
    pricingPlanId: "FREE",
    name: "Miễn phí",
    duration: "Dùng lâu dài",
    price: "0đ",
    credits: "5 tín dụng mỗi ngày",
    icon: Sparkles,
    features: ["Kiểm tra ảnh cơ bản", "5 tín dụng mỗi ngày", "Hỗ trợ qua cộng đồng"],
  },
  {
    id: "basic",
    pricingPlanId: "BASIC",
    name: "Tiêu chuẩn",
    duration: "1 tháng",
    price: "99.000đ",
    originalPrice: "199.000đ",
    credits: "500 tín dụng mỗi tháng",
    icon: Star,
    highlighted: true,
    features: ["Kiểm tra ảnh và âm thanh", "Xử lý ưu tiên", "Hỗ trợ qua email"],
  },
  {
    id: "pro",
    pricingPlanId: "PRO",
    name: "Chuyên nghiệp",
    duration: "3 tháng",
    price: "539.000đ",
    originalPrice: "597.000đ",
    saving: "Tiết kiệm 10%",
    credits: "500 tín dụng mỗi tháng",
    icon: Zap,
    features: ["Kiểm tra ảnh, video và âm thanh", "Báo cáo PDF", "Ưu tiên hỗ trợ"],
  },
  {
    id: "premium",
    pricingPlanId: "PREMIUM",
    name: "Doanh nghiệp nhỏ",
    duration: "6 tháng",
    price: "1.019.000đ",
    originalPrice: "1.194.000đ",
    saving: "Tiết kiệm 15%",
    credits: "833 tín dụng mỗi tháng",
    icon: ShieldCheck,
    features: ["Mọi loại nội dung", "Báo cáo PDF và quyền truy cập API", "Hỗ trợ ưu tiên"],
  },
];

function formatDate(value: string | null) {
  if (!value) return "Không giới hạn";
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function Plan() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [subscription, setSubscription] = useState<CurrentSubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [choosingPlan, setChoosingPlan] = useState<string | null>(null);

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
      setSubscriptionError(error instanceof Error ? error.message : "Không thể tải thông tin gói hiện tại.");
    } finally {
      setLoadingSubscription(false);
    }
  }, [accessToken]);

  useEffect(() => { loadSubscription(); }, [loadSubscription]);
  useEffect(() => {
    const reloadWhenVisible = () => { if (document.visibilityState === "visible") loadSubscription(); };
    document.addEventListener("visibilitychange", reloadWhenVisible);
    return () => document.removeEventListener("visibilitychange", reloadWhenVisible);
  }, [loadSubscription]);

  const activePlanId = subscription?.pricingPlanId;
  const currentPlan = plans.find((plan) => plan.pricingPlanId === activePlanId);
  const currentPlanName = currentPlan?.name || subscription?.pricingPlanName || "Đang tải";
  const totalCredits = (credits?.remainingCredits ?? 0) + (credits?.usedCredits ?? 0);
  const usedPercent = totalCredits > 0 ? Math.min(100, Math.round(((credits?.usedCredits ?? 0) / totalCredits) * 100)) : 0;

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
    navigate(`/payment/sepay/${plan.pricingPlanId}`);
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
            <section className="mt-7 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]" aria-labelledby="current-plan-title">
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><CreditCard className="h-5 w-5" /></span><div><p className="text-[12px] font-bold uppercase tracking-[0.09em] text-primary">Gói hiện tại</p><h2 id="current-plan-title" className="mt-1 text-[20px] font-bold tracking-[-0.025em] text-slate-900 dark:text-white">{loadingSubscription ? "Đang tải thông tin gói…" : currentPlanName}</h2><p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{loadingSubscription ? "" : subscription?.status === "ACTIVE" ? `Hiệu lực đến ${formatDate(subscription.endDate)}` : "Gói dùng miễn phí, không cần gia hạn."}</p></div></div>
                    {!loadingSubscription && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Đang hoạt động</span>}
                  </div>

                  <div className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
                    <div className="flex items-center justify-between gap-4"><p className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-100"><Zap className="h-4 w-4 text-primary" /> Tín dụng đã dùng</p><span className="text-[13px] font-bold text-primary">{creditsLoading ? "…" : `${credits?.usedCredits ?? 0} / ${totalCredits}`}</span></div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${usedPercent}%` }} /></div>
                    <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">Còn lại {creditsLoading ? "…" : credits?.remainingCredits ?? 0} tín dụng. Số liệu được cập nhật từ tài khoản của bạn.</p>
                  </div>
                </div>
                <div className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[{ label: "Tín dụng còn lại", value: creditsLoading ? "…" : credits?.remainingCredits ?? 0 }, { label: "Đã sử dụng", value: creditsLoading ? "…" : credits?.usedCredits ?? 0 }, { label: "Ngày hết hạn", value: loadingSubscription ? "…" : formatDate(subscription?.endDate ?? null) }].map((item) => <div key={item.label} className="rounded-xl border border-border bg-muted/45 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{item.label}</p><p className="mt-1 text-[16px] font-bold text-slate-800 dark:text-white">{item.value}</p></div>)}
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
                return <article key={plan.id} className={`relative flex min-h-[420px] flex-col rounded-2xl border bg-card p-5 shadow-sm shadow-slate-900/[0.03] ${current ? "border-primary ring-1 ring-primary/25" : plan.highlighted ? "border-primary/45" : "border-border"}`}>
                  {plan.highlighted && !current && <span className="absolute -top-3 left-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">Được chọn nhiều</span>}
                  {current && <span className="absolute -top-3 right-4 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">Đang dùng</span>}
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${current || plan.highlighted ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}><Icon className="h-5 w-5" /></span>
                  <div className="mt-4"><h3 className="text-[18px] font-bold text-slate-900 dark:text-white">{plan.name}</h3><p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{plan.duration}</p></div>
                  <div className="mt-5">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-2xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">{plan.price}</p>
                      {plan.originalPrice && <span className="text-[12px] text-slate-400 line-through">{plan.originalPrice}</span>}
                    </div>
                    {plan.saving && (
                      <span className="mt-2 inline-flex rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{plan.saving}</span>
                    )}
                    <p className="mt-2 text-[12px] font-bold text-primary">{plan.credits}</p>
                  </div>
                  <ul className="mt-5 space-y-2.5 border-t border-border pt-5">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-[12px] leading-5 text-slate-600 dark:text-slate-300"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{feature}</li>)}</ul>
                  <button type="button" onClick={() => choosePlan(plan)} disabled={current || loadingSubscription || Boolean(subscriptionError) || choosingPlan === plan.id} className={`mt-auto w-full rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${current ? "bg-secondary text-secondary-foreground" : plan.highlighted ? "bg-primary text-primary-foreground hover:bg-[#406dcc]" : "border border-border bg-card text-slate-700 hover:bg-muted dark:text-slate-200"}`}>{choosingPlan === plan.id ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Đang chuyển…</span> : current ? "Gói hiện tại" : loadingSubscription ? "Đang kiểm tra…" : "Chọn gói này"}</button>
                </article>;
              })}
            </div>
          </section>

          <section className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]"><div><h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Cần hoá đơn hoặc hỗ trợ thanh toán?</h2><p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Đội ngũ DeepGuard sẵn sàng hỗ trợ bạn qua kênh liên hệ.</p></div><button type="button" onClick={() => navigate("/contact")} className="rounded-lg border border-border px-4 py-2.5 text-[13px] font-bold text-primary hover:bg-primary/[0.035]">Liên hệ hỗ trợ</button></section>
        </div>
      </div>
    </DashboardLayout>
  );
}
