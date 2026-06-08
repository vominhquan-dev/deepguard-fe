import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
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
  Cpu,
  CheckCircle2,
  Sun,
  Moon,
  User,
  Zap,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import type { LoginRequest } from "../types/auth";

const leftFeatures = [
  {
    icon: Shield,
    title: "Military-grade encryption",
    desc: "TLS 1.3 for all transfers, AES-256 at rest",
  },
  {
    icon: Cpu,
    title: "Multi-model AI engine",
    desc: "7 specialized models running in parallel",
  },
  {
    icon: Zap,
    title: "Results in under 30 seconds",
    desc: "Real-time processing with instant verdict",
  },
];

const leftStats = [
  { value: "98.7%", label: "Accuracy" },
  { value: "2.4M+", label: "Files Scanned" },
  { value: "50K+", label: "Users" },
];

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { setAccessToken, fetchProfile } = useAuth();
  const [username, setUsername] = useState(
    (location.state as any)?.email || "",
  );
  const [password, setPassword] = useState(
    (location.state as any)?.password || "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsLoggingIn(true);

    try {
      const credentials: LoginRequest = {
        identifier: username,
        password,
      };

      const response = await login(credentials);

      if (response.success) {
        // Store tokens
        const token = response.data.accessToken;
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        // Set token
        setAccessToken(token);

        // Get role from login response (TokenData extends Partial<UserInfo>)
        const loginRole = response.data.role;

        // Fetch user info from auth/me API to get correct role
        try {
          const userInfoData = await fetchProfile(token);

          // Redirect based on role
          const redirectPath =
            userInfoData.role === "ADMIN" ? "/dashboard" : "/detect";
          toast.success("Welcome back! Redirecting...");

          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 500);
        } catch {
          // Fallback: use role from login response if available
          const redirectPath = loginRole === "ADMIN" ? "/dashboard" : "/detect";
          toast.success("Welcome back! Redirecting...");
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 500);
        }
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";

      if (error instanceof Error) {
        // Check if it's an AuthError with specific error codes
        const authError = error as any;
        if (authError.code === "INVALID_CREDENTIALS") {
          errorMessage = "Invalid username or password. Please try again.";
        } else if (authError.code === "USER_NOT_FOUND") {
          errorMessage = "User account not found.";
        } else if (authError.code === "ACCOUNT_DISABLED") {
          errorMessage = "This account has been disabled.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuest = () => {
    toast.info("Continuing as guest — 3 free scans available today.");
    navigate("/detect");
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
        {/* Grid bg */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#2563EB]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 rounded-full bg-[#22D3EE]/10 blur-3xl pointer-events-none" />

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

        {/* Main content */}
        <div className="relative flex-1 flex flex-col justify-center">
          <div className="mb-4">
            <span
              className="px-3 py-1 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE]"
              style={{ fontSize: "11px", fontWeight: 600 }}
            >
              Trusted by 50,000+ security professionals
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
            The AI layer protecting your digital trust
          </h2>
          <p
            className="text-slate-400 mb-10"
            style={{ fontSize: "14px", lineHeight: 1.7 }}
          >
            Detect AI-generated images, deepfake videos, and cloned voices —
            with military-grade accuracy in under 30 seconds.
          </p>

          {/* Features */}
          <div className="space-y-5">
            {leftFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#22D3EE]" />
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

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80">
          {leftStats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div
                className="text-white"
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                {value}
              </div>
              <div
                className="text-slate-500"
                style={{ fontSize: "11px", fontWeight: 500, marginTop: "2px" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-slate-50 dark:bg-[#0F172A]">
        <div className="w-full max-w-[400px]">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10">
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
            <div className="mb-8">
              <h1
                className="text-slate-900 dark:text-white mb-2"
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Welcome back
              </h1>
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "14px" }}
              >
                New to DeepGuard?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  Create a free account
                </button>
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
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="text-slate-700 dark:text-slate-300"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                />
                <span
                  className="text-slate-600 dark:text-slate-400"
                  style={{ fontSize: "13px" }}
                >
                  Remember me for 30 days
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                {isLoggingIn ? (
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
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span
                className="text-slate-400 text-center"
                style={{ fontSize: "12px" }}
              >
                Secured with TLS 1.3 · SOC 2 Type II Certified
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
