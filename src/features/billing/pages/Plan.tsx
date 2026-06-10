import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  CreditCard,
  Sparkles,
  Star,
  BarChart3,
  ShieldCheck,
  Zap,
  Check,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useAuth } from "../../auth/context/AuthContext";
import { useCredits } from "../hooks/useCredits";
import { useState, useEffect, useCallback } from "react";
import { getMyPayments, type PaymentListItem } from "../api/paymentsApi";

interface PlanConfig {
  id: string;
  pricingPlanId: string;
  name: string;
  badge: string;
  price: string;
  period: string;
  originalPrice?: string;
  saveLabel?: string;
  credits: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  popular?: boolean;
  features: string[];
  note?: string;
}

const plans: PlanConfig[] = [
  {
    id: "free",
    pricingPlanId: "FREE",
    name: "Free Tier",
    badge: "Current Plan",
    price: "0",
    period: "forever",
    credits: "5 credits / day",
    icon: Sparkles,
    color: "from-slate-400 to-slate-500",
    features: [
      "5 credits per day",
      "Watch ads to earn +1 credit (daily)",
      "Basic image detection",
      "Community support",
    ],
    note: "Addresses the core needs of 55.8% of surveyed users.",
  },
  {
    id: "premium-1m",
    pricingPlanId: "PREMIUM_1M",
    name: "Premium",
    badge: "1 Month",
    price: "99.000",
    period: "month",
    originalPrice: "199.000",
    credits: "500 credits",
    icon: Star,
    color: "from-[#2563EB] to-[#22D3EE]",
    popular: true,
    features: [
      "500 credits",
      "Image & Audio detection",
      "Priority processing",
      "Email support",
    ],
  },
  {
    id: "premium-3m",
    pricingPlanId: "PREMIUM_3M",
    name: "Pro",
    badge: "3 Months",
    price: "539.000",
    period: "3 months",
    originalPrice: "597.000",
    saveLabel: "Save 10%",
    credits: "500 credits / month",
    icon: Star,
    color: "from-[#2563EB] to-[#22D3EE]",
    features: [
      "500 credits per month",
      "Image, Video & Audio detection",
      "PDF reports",
      "Priority support",
    ],
  },
  {
    id: "premium-6m",
    pricingPlanId: "PREMIUM_6M",
    name: "Premium",
    badge: "6 Months",
    price: "1.019.000",
    period: "6 months",
    originalPrice: "1.194.000",
    saveLabel: "Save 15%",
    credits: "833 credits / month",
    icon: BarChart3,
    color: "from-violet-500 to-[#2563EB]",
    features: [
      "833 credits per month",
      "All media types",
      "PDF reports + API access",
      "Priority support",
      "Advanced analytics",
    ],
  },
];

export function Plan() {
  const navigate = useNavigate();
  const currentPlan = "free";
  const { profile, accessToken } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const dailyLimit = 5;
  const usedToday = credits?.usedCredits ?? 0;
  const usedPercent = Math.min((usedToday / dailyLimit) * 100, 100);

  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      const response = await getMyPayments(accessToken as string);
      if (response.success) {
        setPayments(response.data);
      }
    } catch {
      // Silently fail - show empty state
    } finally {
      setPaymentsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleUpgrade = async (plan: PlanConfig) => {
    if (plan.id === "free") {
      toast.info("You are already on this plan");
      return;
    }

    setUpgradingPlan(plan.id);
    try {
      // Navigate to SePay payment page with the pricingPlanId
      navigate(`/payment/sepay/${plan.pricingPlanId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initiate payment",
      );
    } finally {
      setUpgradingPlan(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "SUCCESS":
        return {
          label: status === "SUCCESS" ? "Success" : "Completed",
          color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: CheckCircle,
        };
      case "PENDING":
        return {
          label: "Pending",
          color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: Clock,
        };
      case "FAILED":
        return {
          label: "Failed",
          color: "bg-red-500/10 text-red-500 border-red-500/20",
          icon: AlertCircle,
        };
      case "EXPIRED":
        return {
          label: "Expired",
          color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
          icon: AlertCircle,
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
          icon: Clock,
        };
    }
  };

  const formatDate = (dateStr: string) => {
    // API returns UTC time (e.g. "2026-06-10T18:09:31.031771").
    // Parse numbers and treat as UTC, convert to GMT+7 by adding 7 hours manually.
    const normalized = dateStr.replace(" ", "T");
    const [datePart, timePart] = normalized.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart ? timePart.split(":").map(Number) : [0, 0];
    // Force UTC+7 by adding 7 hours to UTC timestamp, then use getUTCHours
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const gmt7 = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
    return `${String(gmt7.getUTCHours()).padStart(2, "0")}:${String(gmt7.getUTCMinutes()).padStart(2, "0")} ${String(gmt7.getUTCDate()).padStart(2, "0")}/${String(gmt7.getUTCMonth() + 1).padStart(2, "0")}/${gmt7.getUTCFullYear()}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "₫";
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-slate-400 dark:bg-slate-600" />
            <h1
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Plan & Billing
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            Manage your subscription and view usage
          </p>
        </div>

        {/* Current plan summary */}
        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-slate-900 dark:text-white mb-1"
                style={{ fontSize: "16px", fontWeight: 700 }}
              >
                Your Plan
              </h2>
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "13px" }}
              >
                You are currently on the{" "}
                <span className="text-slate-900 dark:text-white font-semibold">
                  Free Tier
                </span>
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p
                className="text-emerald-500"
                style={{ fontSize: "12px", fontWeight: 700 }}
              >
                Active
              </p>
            </div>
          </div>

          {/* Credits today */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#2563EB]/5 to-[#22D3EE]/5 border border-[#2563EB]/20 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-slate-700 dark:text-slate-300"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <Zap className="w-3.5 h-3.5 inline mr-1.5 text-[#2563EB]" />
                Credits Used Today
              </p>
              <span
                className="text-slate-900 dark:text-white"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                {creditsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                ) : (
                  usedToday
                )}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
                style={{
                  width: `${creditsLoading ? 0 : usedPercent}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <p className="text-slate-400 mt-2" style={{ fontSize: "11px" }}>
              Resets in 24 hours
            </p>
          </div>
        </div>

        {/* Pricing plans */}
        <div>
          <h2
            className="text-slate-900 dark:text-white mb-1"
            style={{ fontSize: "16px", fontWeight: 700 }}
          >
            Upgrade Your Plan
          </h2>
          <p
            className="text-slate-500 dark:text-slate-400 mb-5"
            style={{ fontSize: "13px" }}
          >
            Choose the plan that fits your needs
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = currentPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl ${
                    isCurrent
                      ? "border-[#2563EB] bg-[#2563EB]/5 dark:bg-[#2563EB]/10"
                      : plan.popular
                        ? "border-[#2563EB] bg-white dark:bg-[#1E293B]"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]"
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE] text-white text-xs font-bold shadow-lg">
                      Most Popular
                    </div>
                  )}

                  {/* Current badge */}
                  {isCurrent && (
                    <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg">
                      Current
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p
                        className="text-slate-900 dark:text-white"
                        style={{ fontSize: "15px", fontWeight: 700 }}
                      >
                        {plan.name}
                      </p>
                      <p
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        {plan.badge}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1">
                      {plan.originalPrice && (
                        <span
                          className="text-slate-400 line-through"
                          style={{ fontSize: "14px" }}
                        >
                          {plan.originalPrice}₫
                        </span>
                      )}
                      <span
                        className="text-slate-900 dark:text-white"
                        style={{
                          fontSize: "24px",
                          fontWeight: 800,
                          lineHeight: 1,
                        }}
                      >
                        {plan.price === "0" ? "Free" : `${plan.price}₫`}
                      </span>
                      <span
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: "12px" }}
                      >
                        /{plan.period}
                      </span>
                    </div>
                    {plan.saveLabel && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                        {plan.saveLabel}
                      </span>
                    )}
                    <p
                      className="text-[#2563EB] mt-1"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      {plan.credits}
                    </p>
                  </div>

                  {/* Note for free tier */}
                  {plan.note && (
                    <p
                      className="text-slate-400 mb-3 italic"
                      style={{ fontSize: "11px" }}
                    >
                      {plan.note}
                    </p>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span
                          className="text-slate-600 dark:text-slate-400"
                          style={{ fontSize: "12px" }}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Action button */}
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                      isCurrent
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                        : plan.popular
                          ? "bg-[#2563EB] hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                    disabled={isCurrent || upgradingPlan === plan.id}
                  >
                    {isCurrent ? (
                      "Current Plan"
                    ) : upgradingPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Upgrade"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment history */}
        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-slate-900 dark:text-white"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Billing History
            </h2>
            <button
              onClick={fetchPayments}
              disabled={paymentsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${paymentsLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {paymentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "14px" }}
              >
                No billing history yet
              </p>
              <p
                className="text-slate-400 dark:text-slate-600 mt-1"
                style={{ fontSize: "12px" }}
              >
                Your invoices and receipts will appear here after your first
                purchase.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th
                      className="text-left pb-3 text-slate-500 dark:text-slate-400 font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      Date
                    </th>
                    <th
                      className="text-left pb-3 text-slate-500 dark:text-slate-400 font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      Transaction
                    </th>
                    <th
                      className="text-left pb-3 text-slate-500 dark:text-slate-400 font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      Plan
                    </th>
                    <th
                      className="text-left pb-3 text-slate-500 dark:text-slate-400 font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      Amount
                    </th>
                    <th
                      className="text-left pb-3 text-slate-500 dark:text-slate-400 font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      Credits
                    </th>
                    <th
                      className="text-left pb-3 text-slate-500 dark:text-slate-400 font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      Status
                    </th>
                    <th
                      className="text-right pb-3 text-slate-500 dark:text-slate-400 font-semibold"
                      style={{ fontSize: "12px" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const statusBadge = getStatusBadge(payment.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <tr
                        key={payment.paymentId}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td
                          className="py-3.5 text-slate-700 dark:text-slate-300"
                          style={{ fontSize: "13px" }}
                        >
                          {formatDate(payment.createdAt)}
                        </td>
                        <td
                          className="py-3.5 text-slate-700 dark:text-slate-300 font-mono"
                          style={{ fontSize: "12px" }}
                        >
                          {payment.transactionCode}
                        </td>
                        <td
                          className="py-3.5 text-slate-700 dark:text-slate-300"
                          style={{ fontSize: "13px" }}
                        >
                          {payment.pricingPlanName}
                        </td>
                        <td
                          className="py-3.5 text-slate-900 dark:text-white font-semibold"
                          style={{ fontSize: "13px" }}
                        >
                          {formatCurrency(payment.amount)}
                        </td>
                        <td
                          className="py-3.5 text-slate-700 dark:text-slate-300"
                          style={{ fontSize: "13px" }}
                        >
                          {payment.credits}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${statusBadge.color}`}
                            style={{ fontSize: "11px", fontWeight: 600 }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() =>
                              navigate(
                                `/payment/sepay/${payment.pricingPlanId}`,
                              )
                            }
                            className="text-[#2563EB] hover:text-blue-700 transition-colors"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
