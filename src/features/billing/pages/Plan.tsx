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
import { useTranslation } from "react-i18next";

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
function getPlans(t: (key: string) => string): PlanConfig[] {
  return [
  {
    id: "free",
    pricingPlanId: "FREE",
    name: t("workspace.plan.free"),
    duration: t("workspace.plan.freeDuration"),
    price: "0đ",
    credits: t("workspace.plan.freeCredits"),
    icon: Sparkles,
    features: [
      t("workspace.plan.featureFree1"),
      t("workspace.plan.featureFree2"),
      t("workspace.plan.featureFree3"),
    ],
  },
  {
    id: "premium-1m",
    pricingPlanId: "PREMIUM_1M",
    name: t("workspace.plan.standard"),
    duration: t("workspace.plan.oneMonth"),
    price: "99.000đ",
    originalPrice: "199.000đ",
    credits: t("workspace.plan.standardCredits"),
    icon: Star,
    highlighted: true,
    features: [
      t("workspace.plan.featureStandard1"),
      t("workspace.plan.featureStandard2"),
      t("workspace.plan.featureStandard3"),
    ],
  },
  {
    id: "premium-3m",
    pricingPlanId: "PREMIUM_3M",
    name: t("workspace.plan.professional"),
    duration: t("workspace.plan.threeMonths"),
    price: "539.000đ",
    originalPrice: "597.000đ",
    saving: t("workspace.plan.save10"),
    credits: t("workspace.plan.professionalCredits"),
    icon: Zap,
    features: [
      t("workspace.plan.featureProfessional1"),
      t("workspace.plan.featureProfessional2"),
      t("workspace.plan.featureProfessional3"),
    ],
  },
  {
    id: "premium-6m",
    pricingPlanId: "PREMIUM_6M",
    name: t("workspace.plan.smallBusiness"),
    duration: t("workspace.plan.sixMonths"),
    price: "1.019.000đ",
    originalPrice: "1.194.000đ",
    saving: t("workspace.plan.save15"),
    credits: t("workspace.plan.businessCredits"),
    icon: ShieldCheck,
    features: [
      t("workspace.plan.featureBusiness1"),
      t("workspace.plan.featureBusiness2"),
      t("workspace.plan.featureBusiness3"),
    ],
  },
  ];
}

function formatDate(value: string | null | undefined, language: string) {
  if (!value) return language === "vi" ? "Không giới hạn" : "No expiry";
  const normalized = value.replace(" ", "T");
  const [datePart, timePart] = normalized.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart ? timePart.split(":").map(Number) : [0, 0];
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const gmt7 = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  return gmt7.toLocaleDateString(language === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
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

function getPaymentStatus(status: string, t: (key: string) => string) {
  switch (status) {
    case "COMPLETED":
    case "SUCCESS":
      return {
        label: t("billing.status.completed"),
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        icon: CheckCircle,
      };
    case "PENDING":
      return {
        label: t("billing.status.pending"),
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        icon: Clock,
      };
    case "FAILED":
      return {
        label: t("billing.status.failed"),
        color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        icon: AlertCircle,
      };
    case "EXPIRED":
    case "CANCELLED":
      return {
        label: status === "EXPIRED" ? t("billing.status.expired") : t("billing.status.cancelled"),
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
  const { t, i18n } = useTranslation();
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
      setSubscriptionError(t("errors.api.loginAgain"));
      setLoadingSubscription(false);
      return;
    }

    setLoadingSubscription(true);
    setSubscriptionError(null);
    try {
      setSubscription(await getCurrentSubscription(accessToken));
    } catch (error) {
      setSubscriptionError(
        error instanceof Error ? error.message : t("errors.api.fetchPaymentFailed"),
      );
    } finally {
      setLoadingSubscription(false);
    }
  }, [accessToken, t]);

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

  const plans = getPlans(t);
  const activePlanId = subscription?.pricingPlanId;
  const currentPlan = plans.find((plan) => plan.pricingPlanId === activePlanId);
  const currentPlanName = currentPlan?.name || subscription?.pricingPlanName || t("workspace.plan.loadingPlan");
  const usedCredits = credits?.usedCredits ?? 0;
  const remainingCredits = credits?.remainingCredits ?? 0;
  const totalCredits = usedCredits + remainingCredits;
  const usedPercent = totalCredits > 0 ? Math.min(100, Math.round((usedCredits / totalCredits) * 100)) : 0;

  const choosePlan = (plan: PlanConfig) => {
    if (loadingSubscription) return;
    if (subscriptionError) {
      toast.error(t("errors.api.initPaymentFailed"));
      return;
    }
    if (plan.pricingPlanId === activePlanId) {
      toast.info(t("errors.api.alreadyOnPlan"));
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
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">{t("workspace.plan.eyebrow")}</p>
            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">{t("workspace.plan.title")}</h1>
            <p className="mt-2 text-[14px] leading-6 text-slate-600 dark:text-slate-300">{t("workspace.plan.subtitle")}</p>
          </header>

          {subscriptionError ? (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/25 dark:bg-amber-500/[0.08]">
              <p className="flex items-center gap-2 text-[13px] text-amber-800 dark:text-amber-300"><CircleAlert className="h-4 w-4 shrink-0" />{subscriptionError}</p>
              <button type="button" onClick={loadSubscription} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"><RefreshCw className="h-3.5 w-3.5" /> {t("workspace.plan.retry")}</button>
            </div>
          ) : (
            <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]" aria-labelledby="current-plan-title">
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><CreditCard className="h-5 w-5" /></span>
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-[0.09em] text-primary">{t("workspace.plan.currentPlan")}</p>
                        <h2 id="current-plan-title" className="mt-1 text-[20px] font-bold tracking-[-0.025em] text-slate-900 dark:text-white">{loadingSubscription ? t("workspace.plan.loadingPlan") : currentPlanName}</h2>
                        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{loadingSubscription ? "" : subscription?.status === "ACTIVE" ? t("workspace.plan.activeUntil", { date: formatDate(subscription.endDate, i18n.resolvedLanguage || "vi") }) : t("workspace.plan.freePlan")}</p>
                      </div>
                    </div>
                    {!loadingSubscription && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{t("workspace.plan.active")}</span>}
                  </div>

                  <div className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
                    <div className="flex items-center justify-between gap-4"><p className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-100"><Zap className="h-4 w-4 text-primary" /> {t("workspace.plan.creditsUsed")}</p><span className="text-[13px] font-bold text-primary">{creditsLoading ? "…" : `${usedCredits} / ${totalCredits}`}</span></div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${usedPercent}%` }} /></div>
                    <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">{t("workspace.plan.creditsRemaining", { count: creditsLoading ? "…" : remainingCredits })}</p>
                  </div>
                </div>
                <div className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    { label: t("workspace.plan.remainingCredits"), value: creditsLoading ? "…" : remainingCredits },
                    { label: t("workspace.plan.usedCredits"), value: creditsLoading ? "…" : usedCredits },
                    { label: t("workspace.plan.expiryDate"), value: loadingSubscription ? "…" : formatDate(subscription?.endDate, i18n.resolvedLanguage || "vi") },
                  ].map((item) => <div key={item.label} className="rounded-xl border border-border bg-muted/45 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{item.label}</p><p className="mt-1 text-[16px] font-bold text-slate-800 dark:text-white">{item.value}</p></div>)}
                </div>
              </div>
            </section>
          )}

          <section className="mt-9" aria-labelledby="plans-title">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="plans-title" className="text-xl font-bold tracking-[-0.025em] text-slate-900 dark:text-white">{t("workspace.plan.choosePlan")}</h2><p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{t("workspace.plan.securePayment")}</p></div><p className="text-[12px] text-slate-500 dark:text-slate-400">{t("workspace.plan.upgradeAnytime")}</p></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const current = plan.pricingPlanId === activePlanId;
                return (
                  <article key={plan.id} className={`relative flex min-h-[420px] flex-col rounded-xl border bg-card p-5 shadow-sm shadow-slate-900/[0.03] ${current ? "border-primary ring-1 ring-primary/25" : plan.highlighted ? "border-primary/45" : "border-border"}`}>
                    {plan.highlighted && !current && <span className="absolute -top-3 left-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">{t("workspace.plan.popular")}</span>}
                    {current && <span className="absolute -top-3 right-4 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">{t("workspace.plan.current")}</span>}
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${current || plan.highlighted ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}><Icon className="h-5 w-5" /></span>
                    <div className="mt-4"><h3 className="text-[18px] font-bold text-slate-900 dark:text-white">{plan.name}</h3><p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{plan.duration}</p></div>
                    <div className="mt-5"><div className="flex flex-wrap items-baseline gap-x-2"><p className="text-2xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">{plan.price}</p>{plan.originalPrice && <span className="text-[12px] text-slate-400 line-through">{plan.originalPrice}</span>}</div>{plan.saving && <span className="mt-2 inline-flex rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{plan.saving}</span>}<p className="mt-2 text-[12px] font-bold text-primary">{plan.credits}</p></div>
                    <ul className="mt-5 space-y-2.5 border-t border-border pt-5">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-[12px] leading-5 text-slate-600 dark:text-slate-300"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{feature}</li>)}</ul>
                    <button type="button" onClick={() => choosePlan(plan)} disabled={current || loadingSubscription || Boolean(subscriptionError) || choosingPlan === plan.id} className={`mt-auto w-full rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${current ? "bg-secondary text-secondary-foreground" : plan.highlighted ? "bg-primary text-primary-foreground hover:bg-[#406dcc]" : "border border-border bg-card text-slate-700 hover:bg-muted dark:text-slate-200"}`}>{choosingPlan === plan.id ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />{t("workspace.plan.redirecting")}</span> : current ? t("workspace.plan.currentPlan") : loadingSubscription ? t("workspace.plan.checking") : t("workspace.plan.selectThis")}</button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm shadow-slate-900/[0.03]"><div><h2 className="text-[15px] font-bold text-slate-900 dark:text-white">{t("workspace.plan.supportTitle")}</h2><p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{t("workspace.plan.supportSubtitle")}</p></div><button type="button" onClick={() => navigate("/contact")} className="rounded-lg border border-border px-4 py-2.5 text-[13px] font-bold text-primary hover:bg-primary/[0.035]">{t("workspace.plan.contactSupport")}</button></section>

          <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]" aria-labelledby="billing-history-title">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6"><div><h2 id="billing-history-title" className="text-[16px] font-bold text-slate-900 dark:text-white">{t("workspace.plan.paymentHistory")}</h2><p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{t("workspace.plan.paymentHistorySubtitle")}</p></div><button type="button" onClick={loadPayments} disabled={paymentsLoading} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold text-primary transition-colors hover:bg-primary/[0.035] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${paymentsLoading ? "animate-spin" : ""}`} /> {t("workspace.plan.refresh")}</button></div>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-12"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center"><CreditCard className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-[14px] text-slate-500 dark:text-slate-400">{t("workspace.plan.noPayments")}</p></div>
            ) : (
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-muted/45"><tr className="text-[11px] font-bold uppercase tracking-[0.07em] text-slate-500 dark:text-slate-400"><th className="px-5 py-3 sm:px-6">{t("workspace.plan.date")}</th><th className="px-3 py-3">{t("workspace.plan.transaction")}</th><th className="px-3 py-3">{t("billing.plan")}</th><th className="px-3 py-3">{t("workspace.plan.amount")}</th><th className="px-3 py-3">{t("workspace.plan.credits")}</th><th className="px-3 py-3">{t("workspace.plan.status")}</th><th className="px-5 py-3 text-right sm:px-6">{t("workspace.plan.action")}</th></tr></thead><tbody>{payments.map((payment) => { const badge = getPaymentStatus(payment.status, t); const StatusIcon = badge.icon; return <tr key={payment.paymentId} className="border-t border-border text-[13px] text-slate-600 transition-colors hover:bg-muted/35 dark:text-slate-300"><td className="px-5 py-3.5 sm:px-6">{formatPaymentDate(payment.createdAt)}</td><td className="px-3 py-3.5 font-mono text-[12px]">{payment.transactionCode}</td><td className="px-3 py-3.5">{payment.pricingPlanName}</td><td className="px-3 py-3.5 font-semibold text-slate-900 dark:text-white">{payment.amount.toLocaleString(i18n.resolvedLanguage === "vi" ? "vi-VN" : "en-US")}₫</td><td className="px-3 py-3.5">{payment.credits}</td><td className="px-3 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.color}`}><StatusIcon className="h-3 w-3" />{badge.label}</span></td><td className="px-5 py-3.5 text-right sm:px-6"><button type="button" onClick={() => navigate(`/payment/sepay/${payment.pricingPlanId}`)} className="font-semibold text-primary hover:underline">{t("workspace.plan.view")}</button></td></tr>; })}</tbody></table></div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
