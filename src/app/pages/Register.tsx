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
import { useTheme } from "../contexts/ThemeContext";

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

type Plan = "free" | "premium";

export function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      toast.error("Please accept the Terms of Service to continue.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Account created! Welcome to DeepGuard AI.`);
      setTimeout(() => navigate("/dashboard"), 700);
    }, 1600);
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

            {/* Plan picker */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(
                [
                  {
                    id: "free",
                    label: "Free Plan",
                    sub: "5 Credits/ngày",
                    accent: "#10B981",
                  },
                  {
                    id: "premium",
                    label: "Premium Plan",
                    sub: "199K VND/tháng",
                    accent: "#2563EB",
                  },
                ] as const
              ).map(({ id, label, sub, accent }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlan(id)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    plan === id
                      ? "border-slate-400 dark:border-slate-500 bg-white dark:bg-[#1E293B]"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] opacity-70 hover:opacity-90"
                  }`}
                  style={{ borderColor: plan === id ? accent : undefined }}
                >
                  <p
                    className="text-slate-900 dark:text-white"
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-slate-400"
                    style={{ fontSize: "11px", marginTop: "2px" }}
                  >
                    {sub}
                  </p>
                  {plan === id && (
                    <div
                      className="mt-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: accent }}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label
                  className="block mb-1.5 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="John Doe"
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

              {/* Confirm password */}
              <div>
                <label
                  className="block mb-1.5 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      form.confirm && form.confirm !== form.password
                        ? "border-red-400 focus:ring-red-400/30"
                        : "border-slate-200 dark:border-slate-700 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                    }`}
                    style={{ fontSize: "14px" }}
                  />
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-red-400 mt-1" style={{ fontSize: "11px" }}>
                    Passwords do not match
                  </p>
                )}
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

            {/* Guest option */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-3 bg-slate-50 dark:bg-[#0F172A] text-slate-400"
                  style={{ fontSize: "12px" }}
                >
                  or
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                toast.info("Continuing as guest — 3 free scans available.");
                navigate("/dashboard");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Continue as Guest
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
