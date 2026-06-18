import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { createSePayPayment, type SePayPaymentData } from "../api/sepayApi";
import { getPaymentById } from "../api/paymentsApi";
import { useAuth } from "../../auth/context/AuthContext";

const POLL_INTERVAL = 5000; // 5 seconds
const POLL_DURATION = 300000; // 5 minutes
const PAYMENT_SESSION_KEY_PREFIX = "deepguard_sepay_pending";

// Module-level promises keyed by planId + user to deduplicate concurrent payment creation
// (e.g., React StrictMode double-mount in dev)
const pendingInitPromises = new Map<
  string,
  Promise<{
    response: Awaited<ReturnType<typeof createSePayPayment>>;
  }>
>();

interface PaymentSession {
  paymentId: string;
  planId: string;
  paymentData: SePayPaymentData;
  expiresAt: number;
}

export function SePayPayment() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { accessToken, userInfo } = useAuth();
  const [payment, setPayment] = useState<SePayPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Refs for timers and guards
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollDurationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build a session key scoped to user + planId (Bug 3 fix)
  const getSessionKey = () => {
    const userIdentifier =
      userInfo?.email || userInfo?.id || accessToken?.slice(-8) || "anonymous";
    const safePlanId = planId || "unknown";
    return `${PAYMENT_SESSION_KEY_PREFIX}_${safePlanId}_${userIdentifier}`;
  };

  // Cleanup all timers
  const cleanupTimers = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (pollDurationRef.current) {
      clearTimeout(pollDurationRef.current);
      pollDurationRef.current = null;
    }
    if (navigateTimeoutRef.current) {
      clearTimeout(navigateTimeoutRef.current);
      navigateTimeoutRef.current = null;
    }
    setPolling(false);
  };

  const clearSession = () => {
    sessionStorage.removeItem(getSessionKey());
  };

  const handleCompleted = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    cleanupTimers();
    clearSession();
    setCompleted(true);

    // Show success toast for 3 seconds
    toast.success(
      "🎉 Payment successful! Your plan has been upgraded and credits have been added.",
      {
        duration: 3000,
        position: "top-center",
        style: {
          background: "linear-gradient(135deg, #059669, #10B981)",
          color: "white",
          border: "none",
          fontSize: "14px",
          fontWeight: 600,
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(5, 150, 105, 0.3)",
        },
      },
    );
  };

  const startPolling = (pid: string, token: string) => {
    setPolling(true);

    const checkStatus = async () => {
      try {
        const response = await getPaymentById(pid, token);
        if (!response.success) return;

        const data = response.data;
        if (completedRef.current) return;

        setPaymentStatus(data.status);

        if (data.status === "COMPLETED" || data.status === "SUCCESS") {
          handleCompleted();
        } else if (
          data.status === "FAILED" ||
          data.status === "EXPIRED" ||
          data.status === "CANCELLED"
        ) {
          cleanupTimers();
          clearSession();
          setError(
            data.status === "FAILED"
              ? "Payment failed. Please try again."
              : data.status === "EXPIRED"
                ? "Payment session expired. Please try again."
                : "Payment was cancelled.",
          );
        }
      } catch {
        // Silently retry on next interval
      }
    };

    // Initial check immediately
    checkStatus();

    // Poll every 5s
    pollTimerRef.current = setInterval(checkStatus, POLL_INTERVAL);

    // Stop after 5 minutes
    pollDurationRef.current = setTimeout(() => {
      cleanupTimers();
      clearSession();
      if (!completedRef.current) {
        toast.info(
          "Payment status check ended. You can check your billing history for updates.",
        );
      }
    }, POLL_DURATION);
  };

  // Main initialization effect
  useEffect(() => {
    // Guard: only proceed if we have all required params
    if (!planId || !accessToken) return;

    const token = accessToken;
    const safePlanId: string = planId;
    const dedupKey = `${safePlanId}_${token.slice(-8)}`;

    let isSubscribed = true;

    async function initPayment() {
      // Check sessionStorage first — resume pending payment on page refresh
      const existingRaw = sessionStorage.getItem(getSessionKey());
      if (existingRaw) {
        try {
          const session: PaymentSession = JSON.parse(existingRaw);
          if (
            session.paymentId &&
            session.planId === safePlanId &&
            session.paymentData &&
            session.expiresAt > Date.now()
          ) {
            if (!isSubscribed) return;
            setPayment(session.paymentData);
            setLoading(false);
            startPolling(session.paymentId, token);
            return;
          }
        } catch {
          clearSession();
        }
      }

      // Deduplicate concurrent API calls (e.g. React StrictMode double-mount in dev).
      // Module-level Map keyed by dedupKey ensures different users/plans don't share one promise.
      // (Bug 2 fix: was a single module-level variable shared across all planIds/users)
      if (!pendingInitPromises.has(dedupKey)) {
        const promise = (async () => {
          setLoading(true);
          const response = await createSePayPayment(
            { pricingPlanId: safePlanId },
            token,
          );
          if (!response.success) {
            throw new Error(response.message || "Failed to create payment");
          }
          return { response };
        })();
        pendingInitPromises.set(dedupKey, promise);
        // Clean up the promise map after it resolves/rejects
        promise.finally(() => {
          pendingInitPromises.delete(dedupKey);
        });
      }

      try {
        const result = await pendingInitPromises.get(dedupKey)!;

        if (!isSubscribed) return;

        if (!result.response.success) return;

        setPayment(result.response.data);

        // Save to sessionStorage so page refresh can resume
        sessionStorage.setItem(
          getSessionKey(),
          JSON.stringify({
            paymentId: result.response.data.paymentId,
            planId: safePlanId,
            paymentData: result.response.data,
            expiresAt: Date.now() + POLL_DURATION,
          } satisfies PaymentSession),
        );

        startPolling(result.response.data.paymentId, token);
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    initPayment();

    return () => {
      isSubscribed = false;
      cleanupTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, accessToken]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "14px" }}
            >
              Generating payment QR code...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !payment) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <button
            onClick={() => {
              clearSession();
              navigate("/plan");
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span style={{ fontSize: "14px" }}>Back to Plans</span>
          </button>

          <div className="max-w-md mx-auto mt-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-8 h-8 text-red-500 rotate-45" />
            </div>
            <h2
              className="text-slate-900 dark:text-white mb-2"
              style={{ fontSize: "18px", fontWeight: 700 }}
            >
              Payment Error
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {error || "Unable to create payment"}
            </p>
            <button
              onClick={() => navigate("/plan")}
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const amountFormatted = payment.amount.toLocaleString("vi-VN");

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/plan")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span style={{ fontSize: "14px" }}>Back to Plans</span>
        </button>

        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2
                  className="text-slate-900 dark:text-white"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  Complete Payment
                </h2>
                <p
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "13px" }}
                >
                  Transfer the exact amount via VietQR
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {paymentStatus === "COMPLETED" || completed ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span
                    className="text-emerald-500"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    Completed
                  </span>
                </div>
              ) : paymentStatus === "FAILED" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span
                    className="text-red-500"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    Failed
                  </span>
                </div>
              ) : paymentStatus === "EXPIRED" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span
                    className="text-slate-500"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    Expired
                  </span>
                </div>
              ) : paymentStatus === "CANCELLED" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span
                    className="text-slate-500"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    Cancelled
                  </span>
                </div>
              ) : polling ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                  <span
                    className="text-amber-500"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    Waiting for payment...
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span
                    className="text-amber-500"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    Pending
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Completed state */}
          {completed && (
            <div className="p-6 bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border-b border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3
                    className="text-emerald-600 dark:text-emerald-400 font-bold"
                    style={{ fontSize: "16px" }}
                  >
                    Payment Successful!
                  </h3>
                  <p
                    className="text-emerald-600/70 dark:text-emerald-400/70"
                    style={{ fontSize: "13px" }}
                  >
                    Your plan has been upgraded. {payment.credits} credits have
                    been added to your account.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/plan")}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors"
              >
                Back to Plan
              </button>
            </div>
          )}

          {/* Two-column layout: QR left, info right */}
          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* QR Code - Left */}
            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <img
                  src={payment.qrUrl}
                  alt="VietQR Payment"
                  className="w-72 h-72 sm:w-80 sm:h-80 object-contain"
                />
              </div>
              <a
                href={`https://img.vietqr.io/image/${payment.bankCode}-${payment.bankAccountNo}-compact2.png?amount=${payment.amount}&addInfo=${payment.transferContent}&accountName=${payment.bankAccountName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-500/25"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Banking App
              </a>
            </div>

            {/* Payment details - Right */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Order details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "13px" }}
                  >
                    Plan
                  </span>
                  <span
                    className="text-slate-900 dark:text-white font-semibold"
                    style={{ fontSize: "13px" }}
                  >
                    {payment.planName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "13px" }}
                  >
                    Credits
                  </span>
                  <span
                    className="text-slate-900 dark:text-white font-semibold"
                    style={{ fontSize: "13px" }}
                  >
                    {payment.credits}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "13px" }}
                  >
                    Amount
                  </span>
                  <span
                    className="text-slate-900 dark:text-white font-bold"
                    style={{ fontSize: "16px" }}
                  >
                    {amountFormatted}₫
                  </span>
                </div>
              </div>

              {/* Bank info */}
              <div className="p-4 rounded-xl bg-[#2563EB]/5 border border-[#2563EB]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "13px" }}
                  >
                    Bank
                  </span>
                  <span
                    className="text-slate-900 dark:text-white font-semibold"
                    style={{ fontSize: "13px" }}
                  >
                    Vietcombank
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "13px" }}
                  >
                    Account No.
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-slate-900 dark:text-white font-semibold truncate"
                      style={{ fontSize: "13px" }}
                    >
                      {payment.bankAccountNo}
                    </span>
                    <button
                      onClick={() => handleCopy(payment.bankAccountNo)}
                      className="text-[#2563EB] hover:text-blue-700 transition-colors flex-shrink-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-slate-500 dark:text-slate-400"
                    style={{ fontSize: "13px" }}
                  >
                    Account Name
                  </span>
                  <span
                    className="text-slate-900 dark:text-white font-semibold text-right"
                    style={{ fontSize: "13px" }}
                  >
                    {payment.bankAccountName}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#2563EB]/10">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "13px" }}
                    >
                      Transfer Content
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-[#2563EB] font-bold truncate"
                        style={{ fontSize: "13px" }}
                      >
                        {payment.transferContent}
                      </span>
                      <button
                        onClick={() => handleCopy(payment.transferContent)}
                        className="text-[#2563EB] hover:text-blue-700 transition-colors flex-shrink-0"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p
                  className="text-slate-600 dark:text-slate-300 font-semibold mb-2"
                  style={{ fontSize: "12px" }}
                >
                  📋 Instructions
                </p>
                <ol
                  className="text-slate-500 dark:text-slate-400 space-y-1.5"
                  style={{ fontSize: "12px" }}
                >
                  <li>1. Open your banking app</li>
                  <li>2. Scan the QR code or transfer to the account above</li>
                  <li>
                    3. Enter the exact amount:{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {amountFormatted}₫
                    </strong>
                  </li>
                  <li>4. Copy the transfer content exactly as shown</li>
                  <li>5. Complete the transfer</li>
                </ol>
                <p
                  className="text-slate-400 mt-2 italic"
                  style={{ fontSize: "11px" }}
                >
                  Credits will be added automatically after payment is
                  confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
