import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import {
  Shield,
  Mail,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { verifyEmail, resendOtp } from "../api/authApi";
import type { VerifyEmailRequest } from "../types/auth";

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const email = (location.state as any)?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Auto-send OTP when page loads
  useEffect(() => {
    if (!email) {
      navigate("/register");
      return;
    }

    const sendOtp = async () => {
      try {
        await resendOtp(email);
      } catch (error) {
        console.error("Failed to send OTP:", error);
      }
    };

    sendOtp();
  }, [email, navigate]);

  // Timer for resend
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid 6-character OTP.");
      return;
    }

    setLoading(true);
    try {
      const payload: VerifyEmailRequest = { email, otp };
      const response = await verifyEmail(payload);

      if (response.success) {
        toast.success("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 600);
      }
    } catch (error) {
      let errorMessage = "Email verification failed.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendOtp(email);
      toast.success("OTP resent to your email. Check your inbox.");
      setTimeLeft(60);
      setCanResend(false);
    } catch (error) {
      let errorMessage = "Failed to resend OTP. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Toaster
        theme={theme}
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1E293B" : "#fff",
            border:
              theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            color: theme === "dark" ? "#e2e8f0" : "#0f172a",
            borderRadius: "12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
          },
        }}
      />

      {/* Left side - Verification form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 lg:p-12 bg-white dark:bg-[#0F172A]">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-slate-900 dark:text-white"
              style={{ fontWeight: 700, fontSize: "15px" }}
            >
              Deep<span className="text-[#22D3EE]">Guard</span>
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-sm">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-lg bg-[#2563EB]/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#2563EB]" />
              </div>
              <h1
                className="text-slate-900 dark:text-white mb-2"
                style={{ fontSize: "28px", fontWeight: 700 }}
              >
                Verify your email
              </h1>
              <p
                className="text-slate-600 dark:text-slate-400"
                style={{ fontSize: "14px" }}
              >
                We've sent a verification code to{" "}
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {/* OTP Input */}
              <div>
                <label
                  className="block text-slate-700 dark:text-slate-300 mb-2"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value.toUpperCase().slice(0, 6);
                    setOtp(input.value);
                  }}
                  inputMode="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  style={{ fontSize: "16px", letterSpacing: "0.1em" }}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1e4fb5] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                style={{ fontSize: "14px" }}
              >
                {loading ? "Verifying..." : "Verify Email"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Resend Code */}
              <div className="text-center mt-6">
                <p
                  className="text-slate-600 dark:text-slate-400 mb-2"
                  style={{ fontSize: "13px" }}
                >
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || resendLoading}
                  className="text-[#2563EB] hover:text-[#1e4fb5] disabled:text-slate-400 font-semibold transition-colors flex items-center justify-center gap-1"
                  style={{ fontSize: "13px" }}
                >
                  {canResend ? (
                    <>{resendLoading ? "Resending..." : "Resend code"}</>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" />
                      Resend in {timeLeft}s
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Footer */}
        <div
          className="text-center text-slate-600 dark:text-slate-400"
          style={{ fontSize: "12px" }}
        >
          <p>
            Already verified?{" "}
            <a href="/login" className="text-[#2563EB] hover:underline">
              Back to login
            </a>
          </p>
        </div>
      </div>

      {/* Right side - Info (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#2563EB] to-[#1e40af]">
        <div>
          <h2
            className="text-white mb-6"
            style={{ fontSize: "32px", fontWeight: 700, lineHeight: 1.3 }}
          >
            Email verified means secure access
          </h2>
          <p
            className="text-blue-100 mb-12"
            style={{ fontSize: "15px", lineHeight: 1.6 }}
          >
            By verifying your email, you're securing your DeepGuard account and
            enabling all advanced features.
          </p>
        </div>

        {/* Info cards */}
        <div className="space-y-4">
          {[
            {
              icon: CheckCircle2,
              title: "Instant activation",
              desc: "Access all features immediately",
            },
            {
              icon: Mail,
              title: "Account recovery",
              desc: "Reset your password anytime",
            },
            {
              icon: Shield,
              title: "Enhanced security",
              desc: "Two-factor authentication ready",
            },
          ].map(({ icon: Icon, title, desc }, idx) => (
            <div key={idx} className="flex gap-3">
              <Icon className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
              <div>
                <p
                  className="text-white font-semibold"
                  style={{ fontSize: "13px" }}
                >
                  {title}
                </p>
                <p className="text-blue-100" style={{ fontSize: "12px" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
