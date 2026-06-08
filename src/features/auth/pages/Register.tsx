import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sun,
  Moon,
  User,
  Star,
  BarChart3,
  FileText,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { register } from "../api/authApi";
import type { RegisterRequest } from "../types/auth";

const benefits = [
  {
    icon: BarChart3,
    title: "Full scan history",
    desc: "Track every detection with detailed logs and timestamps.",
  },
  {
    icon: FileText,
    title: "Downloadable PDF reports",
    desc: "Export litigation-ready reports for any scan result.",
  },
  {
    icon: Star,
    title: "Priority analysis queue",
    desc: "Pro users jump the queue for instant results.",
  },
];

export function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.username || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreed) {
      toast.error("Please accept the Terms of Service to continue.");
      return;
    }
    setLoading(true);
    try {
      const payload: RegisterRequest = {
        email: form.email,
        username: form.username,
        password: form.password,
      };
      const response = await register(payload);

      if (response.success) {
        toast.success("Account created! Check your email to verify.");
        setTimeout(() => {
          navigate("/verify-email", {
            state: { email: form.email, password: form.password },
          });
        }, 700);
      }
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

      {/* ── Left branded panel ── */}
      <div className="hidden lg:flex flex-col w-[460px] min-h-screen bg-[#060D1A] relative overflow-hidden p-12 flex-shrink-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#8B5CF6]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 rounded-full bg-[#22D3EE]/8 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span
              className="text-white"
              style={{
                fontWeight: 700,
                fontSize: "17px",
                letterSpacing: "-0.3px",
              }}
            >
              Deep<span className="text-[#22D3EE]">Guard</span>
            </span>
            <span
              className="block text-slate-600"
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              AI Platform
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span
              className="text-emerald-400"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              50,000+ active users worldwide
            </span>
          </div>

          <h2
            className="text-white mb-4"
            style={{
              fontSize: "28px",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            Join the most advanced deepfake detection platform
          </h2>
          <p
            className="text-slate-400 mb-10"
            style={{ fontSize: "14px", lineHeight: 1.7 }}
          >
            Create your free account and start protecting yourself from
            synthetic media threats in under 60 seconds.
          </p>

          <div className="space-y-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div>
                  <p
                    className="text-white mb-0.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-slate-500"
                    style={{ fontSize: "12px", lineHeight: 1.5 }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust */}
        <div className="relative flex items-center gap-2 pt-8 border-t border-slate-800/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-slate-400" style={{ fontSize: "12px" }}>
            No credit card required for the Free plan
          </span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-slate-50 dark:bg-[#0F172A] overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              ← Back to home
            </button>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h1
                className="text-slate-900 dark:text-white mb-2"
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Create your account
              </h1>
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "14px" }}
              >
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  Sign in
                </button>
              </p>
            </div>

            {/* Free Plan Info */}
            <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 mb-6">
              <p
                className="text-slate-900 dark:text-white"
                style={{ fontSize: "13px", fontWeight: 700 }}
              >
                Free Plan
              </p>
              <p
                className="text-slate-400"
                style={{ fontSize: "11px", marginTop: "2px" }}
              >
                25 credits
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label
                  className="block mb-1.5 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => update("username", e.target.value)}
                    placeholder="johndoe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className="block mb-1.5 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="john@company.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block mb-1.5 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                    style={{ fontSize: "14px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className="block mb-1.5 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                    style={{ fontSize: "14px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 mt-0.5 flex-shrink-0"
                />
                <span
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "12px", lineHeight: 1.5 }}
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/privacy")}
                    className="text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                    style={{ fontWeight: 600 }}
                  >
                    Privacy Policy
                  </button>{" "}
                  and Terms of Service
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                  />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
