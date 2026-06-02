import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Shield,
  ArrowRight,
  Upload,
  Cpu,
  BarChart3,
  Image,
  Video,
  Mic,
  AlertTriangle,
  FileText,
  Lock,
  EyeOff,
  Trash2,
  Github,
  Sun,
  Moon,
  ChevronRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { SecurityTransparency } from "../../../shared/components/SecurityTransparency";

const heroImage =
  "https://images.unsplash.com/photo-1769684328001-dc78599f1518?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwQUklMjB0ZWNobm9sb2d5JTIwZGFyayUyMGFic3RyYWN0fGVufDF8fHx8MTc3MjYzNTUyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Media",
    desc: "Drag & drop or select your image, video, or audio file. We support all major formats.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analysis",
    desc: "Our multi-model AI system analyzes content across visual, audio, and metadata layers.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Get Risk Score",
    desc: "Receive a detailed risk score with explanations, confidence levels, and a downloadable report.",
  },
];

const features = [
  {
    icon: Image,
    title: "Image Detection",
    desc: "Detect GAN-generated faces, DALL-E images, and manipulated photos using deep neural network analysis.",
    color: "#2563EB",
  },
  {
    icon: Video,
    title: "Video Frame Analysis",
    desc: "Frame-by-frame temporal analysis to catch inconsistencies in deepfake videos and face swaps.",
    color: "#22D3EE",
  },
  {
    icon: Mic,
    title: "Voice Cloning Detection",
    desc: "Spectral analysis to identify AI-cloned voices, synthetic speech, and audio manipulations.",
    color: "#8B5CF6",
  },
  {
    icon: AlertTriangle,
    title: "AI Risk Score",
    desc: "A 0–100% risk indicator powered by ensemble models trained on millions of real and synthetic samples.",
    color: "#F59E0B",
  },
  {
    icon: FileText,
    title: "Detailed Explanation",
    desc: "Human-readable explanations of what triggered the detection, plus a downloadable PDF report.",
    color: "#10B981",
  },
];

const trustItems = [
  {
    icon: Lock,
    title: "Secure Upload",
    desc: "All transfers are encrypted with TLS 1.3. Your data never leaves our secured infrastructure.",
  },
  {
    icon: EyeOff,
    title: "Privacy Protected",
    desc: "Files are processed in isolated sandboxes. No human ever views your uploaded content.",
  },
  {
    icon: Trash2,
    title: "No Content Stored",
    desc: "Media files are permanently deleted after analysis. Only the result summary is kept.",
  },
];

const stats = [
  { value: "2.4M+", label: "Files Analyzed" },
  { value: "98.7%", label: "Accuracy Rate" },
  { value: "< 30s", label: "Avg. Detection Time" },
  { value: "150+", label: "Countries" },
];

const plans = [
  {
    name: "Premium",
    price: "₫99.000",
    period: "/tháng",
    desc: "Thanh toán theo tháng",
    originalPrice: "₫199.000",
    features: [
      "500 Credits",
      "Image & Audio detection",
      "Priority processing",
      "Email support",
    ],
    cta: "Upgrade",
    highlight: true,
    color: "border-[#2563EB]",
    badge: "MOST POPULAR",
  },
  {
    name: "3 Tháng",
    price: "₫539.000",
    period: "",
    desc: "Tiết kiệm 10% so với gói tháng",
    originalPrice: "₫597.000",
    features: [
      "500 Credits / tháng",
      "Image, Video & Audio detection",
      "PDF reports",
      "Priority support",
    ],
    cta: "Upgrade",
    highlight: false,
    color: "border-slate-200 dark:border-slate-700",
    badge: "SAVE 10%",
  },
  {
    name: "6 Tháng",
    price: "₫1.019.000",
    period: "",
    desc: "Tiết kiệm 15% so với gói tháng",
    originalPrice: "₫1.194.000",
    features: [
      "833 Credits / tháng",
      "All media types",
      "PDF reports + API access",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Upgrade",
    highlight: false,
    color: "border-slate-200 dark:border-slate-700",
    badge: "SAVE 15%",
  },
  {
    name: "Enterprise",
    price: "₫1.920.000",
    period: "/năm",
    desc: "Giá tốt nhất cho nhu cầu dài hạn",
    originalPrice: "₫2.388.000",
    features: [
      "Custom credits",
      "All media types",
      "Dedicated support",
      "Custom integration",
      "SLA guarantee",
    ],
    cta: "Liên hệ",
    highlight: false,
    color: "border-slate-200 dark:border-slate-700",
  },
];

export function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#0F172A]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-slate-900 dark:text-white"
              style={{
                fontWeight: 700,
                fontSize: "18px",
                letterSpacing: "-0.4px",
              }}
            >
              Deep<span className="text-[#22D3EE]">Guard</span>{" "}
              <span
                className="text-slate-400 dark:text-slate-500"
                style={{ fontWeight: 400, fontSize: "14px" }}
              >
                AI
              </span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", id: "features" },
              { label: "How It Works", id: "how-it-works" },
              { label: "Pricing", route: "/pricing" },
              { label: "About", route: "/about" },
            ].map(({ label, id, route }) => (
              <button
                key={label}
                onClick={() => (route ? navigate(route) : scrollTo(id!))}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => navigate("/login")}
              className="hidden md:flex items-center px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Start Detection
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Gradient orb */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#2563EB]/10 dark:bg-[#2563EB]/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[#22D3EE]/8 dark:bg-[#22D3EE]/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 mb-6">
                <Zap className="w-3 h-3 text-[#22D3EE]" />
                <span
                  className="text-[#22D3EE]"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  AI-Powered Detection Engine v2.0
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-slate-900 dark:text-white mb-6"
              style={{
                fontSize: "clamp(36px, 5vw, 60px)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
              }}
            >
              Detect Deepfakes{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #22D3EE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Before They Harm You
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg"
              style={{ fontSize: "18px", lineHeight: 1.7 }}
            >
              AI-powered detection for images, videos, and voice. Get a detailed
              risk analysis in under 30 seconds with 98.7% accuracy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                Start Detection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                style={{ fontSize: "15px", fontWeight: 600 }}
              >
                Learn More
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              {["SOC 2 Compliant", "GDPR Ready", "No Data Stored"].map(
                (badge) => (
                  <div key={badge} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      {badge}
                    </span>
                  </div>
                ),
              )}
            </motion.div>
          </div>

          {/* Right — hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20 dark:shadow-blue-900/20">
              <img
                src={heroImage}
                alt="DeepGuard AI"
                className="w-full h-80 object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent" />
              {/* Scan line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-[#22D3EE]/60"
                style={{ boxShadow: "0 0 12px #22D3EE, 0 0 24px #22D3EE40" }}
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              {/* Stats overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                <div className="flex-1 p-3 rounded-lg bg-[#0F172A]/80 backdrop-blur-sm border border-slate-700/50">
                  <div
                    className="text-[#22D3EE]"
                    style={{ fontSize: "20px", fontWeight: 800 }}
                  >
                    87%
                  </div>
                  <div className="text-slate-400" style={{ fontSize: "11px" }}>
                    Risk Score
                  </div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-[#0F172A]/80 backdrop-blur-sm border border-red-500/30">
                  <div
                    className="text-red-400"
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    DEEPFAKE
                  </div>
                  <div className="text-slate-400" style={{ fontSize: "11px" }}>
                    AI Verdict
                  </div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-[#0F172A]/80 backdrop-blur-sm border border-slate-700/50">
                  <div
                    className="text-emerald-400"
                    style={{ fontSize: "20px", fontWeight: 800 }}
                  >
                    92%
                  </div>
                  <div className="text-slate-400" style={{ fontSize: "11px" }}>
                    Confidence
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div
              className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30"
              style={{ fontSize: "11px", fontWeight: 700 }}
            >
              ⚠ DEEPFAKE DETECTED
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div
                className="text-slate-900 dark:text-white"
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                {value}
              </div>
              <div
                className="text-slate-500 dark:text-slate-500"
                style={{ fontSize: "13px", fontWeight: 500, marginTop: "4px" }}
              >
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-24 bg-slate-50 dark:bg-[#0F172A]"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE] mb-4"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Simple Process
            </span>
            <h2
              className="text-slate-900 dark:text-white mb-4"
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              How It Works
            </h2>
            <p
              className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              style={{ fontSize: "16px", lineHeight: 1.7 }}
            >
              Three simple steps to detect deepfakes with military-grade AI
              accuracy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-[#2563EB] to-[#22D3EE] opacity-30" />

            {steps.map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-[#2563EB]/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group"
              >
                <div
                  className="absolute top-6 right-6 text-slate-200 dark:text-slate-700"
                  style={{
                    fontSize: "48px",
                    fontWeight: 900,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center mb-5 group-hover:bg-[#2563EB]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#2563EB] dark:text-[#22D3EE]" />
                </div>
                <h3
                  className="text-slate-900 dark:text-white mb-3"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  {title}
                </h3>
                <p
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "14px", lineHeight: 1.7 }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white dark:bg-[#0C1220]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE] mb-4"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Capabilities
            </span>
            <h2
              className="text-slate-900 dark:text-white mb-4"
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Powered by Multi-Modal AI
            </h2>
            <p
              className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              style={{ fontSize: "16px", lineHeight: 1.7 }}
            >
              Every layer of your media is analyzed — from pixel patterns to
              voice frequencies.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-lg group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3
                  className="text-slate-900 dark:text-white mb-2"
                  style={{ fontSize: "16px", fontWeight: 700 }}
                >
                  {title}
                </h3>
                <p
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "14px", lineHeight: 1.65 }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Transparency */}
      <SecurityTransparency />

      {/* Trust */}
      <section className="py-24 bg-slate-50 dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Security & Privacy
            </span>
            <h2
              className="text-slate-900 dark:text-white mb-4"
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Built with Trust at the Core
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {trustItems.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <Icon className="w-7 h-7 text-emerald-500" />
                </div>
                <h3
                  className="text-slate-900 dark:text-white mb-3"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  {title}
                </h3>
                <p
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "14px", lineHeight: 1.7 }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50 dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE] mb-4"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Pricing
            </span>
            <h2
              className="text-slate-900 dark:text-white mb-4"
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Simple, Transparent Pricing
            </h2>
            <p
              className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto"
              style={{ fontSize: "16px", lineHeight: 1.7 }}
            >
              Start free. Upgrade when you need it. No hidden fees, no surprise
              charges.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5 items-start">
            {plans.map(
              (
                {
                  name,
                  price,
                  period,
                  desc,
                  features,
                  cta,
                  highlight,
                  color,
                  badge,
                  originalPrice,
                },
                i,
              ) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative rounded-2xl border-2 ${color} ${highlight ? "bg-[#2563EB]" : "bg-white dark:bg-[#1E293B]"} p-6 ${highlight ? "shadow-2xl shadow-blue-500/25 scale-105" : ""} transition-all duration-300`}
                >
                  {badge && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-slate-900 ${badge === "MOST POPULAR" ? "bg-[#22D3EE]" : "bg-pink-500"}`}
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {badge === "MOST POPULAR" ? "✦ MOST POPULAR" : badge}
                    </div>
                  )}

                  <div className="mb-5">
                    <h3
                      className={`mb-1 ${highlight ? "text-white" : "text-slate-900 dark:text-white"}`}
                      style={{ fontSize: "18px", fontWeight: 800 }}
                    >
                      {name}
                    </h3>
                    <p
                      className={`${highlight ? "text-blue-200" : "text-slate-500 dark:text-slate-400"} mb-4`}
                      style={{ fontSize: "13px" }}
                    >
                      {desc}
                    </p>
                    <div className="flex flex-wrap items-end gap-1">
                      {originalPrice && (
                        <span
                          className="text-slate-400 dark:text-slate-500 line-through mr-1"
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                          }}
                        >
                          {originalPrice}
                        </span>
                      )}
                      <span
                        className={`${highlight ? "text-white" : "text-slate-900 dark:text-white"}`}
                        style={{
                          fontSize: "40px",
                          fontWeight: 900,
                          letterSpacing: "-1px",
                          lineHeight: 1,
                        }}
                      >
                        {price}
                      </span>
                      {period && (
                        <span
                          className={`${highlight ? "text-blue-200" : "text-slate-400"} mb-1`}
                          style={{ fontSize: "14px" }}
                        >
                          {period}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 ${highlight ? "text-[#22D3EE]" : "text-emerald-500"}`}
                        />
                        <span
                          className={`${highlight ? "text-blue-100" : "text-slate-600 dark:text-slate-400"}`}
                          style={{ fontSize: "13px" }}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate("/dashboard")}
                    className={`w-full py-3 rounded-xl transition-all duration-200 ${highlight ? "bg-white text-[#2563EB] hover:bg-blue-50 hover:shadow-lg" : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600"}`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    {cta}
                  </button>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-[#2563EB] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-white mb-4"
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Ready to Detect Deepfakes?
            </h2>
            <p
              className="text-blue-100 mb-8"
              style={{ fontSize: "16px", lineHeight: 1.7 }}
            >
              Join 50,000+ journalists, researchers, and security teams already
              using DeepGuard AI.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-xl bg-white text-[#2563EB] hover:bg-blue-50 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Start Free Detection →
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                className="text-slate-900 dark:text-white"
                style={{ fontWeight: 700, fontSize: "16px" }}
              >
                Deep<span className="text-[#22D3EE]">Guard</span> AI
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { label: "About", action: () => navigate("/about") },
                { label: "Privacy Policy", action: () => navigate("/privacy") },
                { label: "Contact", action: () => navigate("/contact") },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  {label}
                </button>
              ))}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
            </div>
            <p className="text-slate-400" style={{ fontSize: "13px" }}>
              © 2026 DeepGuard AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
