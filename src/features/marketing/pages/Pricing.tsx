import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Shield,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  X,
  Zap,
  Star,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Trash2,
  Eye,
  Github,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";

const currencySymbol = "₫";

const plans = [
  {
    name: "Premium",
    tagline: "Thanh toán theo tháng",
    price: 99000,
    originalPrice: 199000,
    savePercent: null,
    icon: Star,
    iconColor: "#10B981",
    iconBg: "bg-emerald-500/10",
    border: "border-slate-200 dark:border-slate-700",
    highlight: false,
    badge: null,
    features: [
      { text: "500 Credits", included: true },
      { text: "Image & Audio detection", included: true },
      { text: "Priority processing", included: true },
      { text: "Email support", included: true },
    ],
    cta: "Upgrade",
    ctaVariant: "outline",
  },
  {
    name: "3 Months",
    tagline: "Tiết kiệm 10% so với gói tháng",
    price: 539000,
    originalPrice: 597000,
    savePercent: 10,
    icon: Zap,
    iconColor: "#2563EB",
    iconBg: "bg-[#2563EB]/10",
    border: "border-[#2563EB]",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "500 Credits / tháng", included: true },
      { text: "Image, Video & Audio detection", included: true },
      { text: "PDF reports", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Upgrade",
    ctaVariant: "primary",
  },
  {
    name: "6 Months",
    tagline: "Tiết kiệm 15% so với gói tháng",
    price: 1019000,
    originalPrice: 1194000,
    savePercent: 15,
    icon: Building2,
    iconColor: "#8B5CF6",
    iconBg: "bg-purple-500/10",
    border: "border-slate-200 dark:border-slate-700",
    highlight: false,
    badge: null,
    features: [
      { text: "833 Credits / tháng", included: true },
      { text: "All media types", included: true },
      { text: "PDF reports + API access", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
    ],
    cta: "Upgrade",
    ctaVariant: "outline",
  },
  {
    name: "Enterprise",
    tagline: "Giá tốt nhất cho nhu cầu dài hạn",
    price: 1920000,
    originalPrice: 2388000,
    savePercent: null,
    icon: Shield,
    iconColor: "#2563EB",
    iconBg: "bg-[#2563EB]/10",
    border: "border-slate-200 dark:border-slate-700",
    highlight: false,
    badge: null,
    features: [
      { text: "Dung lượng cao", included: true },
      { text: "All features + Dedicated support", included: true },
      { text: "Custom integrations", included: true },
    ],
    cta: "Liên hệ",
    ctaVariant: "outline",
  },
];

const faqs = [
  {
    q: "Is the Free plan really free forever?",
    a: "Yes. The Free plan is permanently free with no credit card required. You get 3 scans per day indefinitely. If you need more scans or advanced features, you can upgrade to Pro at any time.",
  },
  {
    q: "What is the difference between monthly and annual billing?",
    a: "Annual billing gives you a 20% discount — Pro drops from $29/month to $23/month, saving you $72 per year. You're billed upfront for the full year.",
  },
  {
    q: "Can I cancel my Pro subscription at any time?",
    a: "Absolutely. You can cancel your Pro subscription at any time from Settings → Billing. Your access continues until the end of the billing period, with no cancellation fees.",
  },
  {
    q: "What file formats are supported?",
    a: "Free and Pro plans support JPG, PNG, WEBP (images), MP4, MOV, AVI (video), and MP3, WAV, M4A (audio). Enterprise plans support additional proprietary formats upon request.",
  },
  {
    q: "Is my uploaded data secure?",
    a: "Yes. All files are processed in isolated sandboxes with TLS 1.3 encryption. Media files are permanently deleted within 60 seconds of analysis completion. We are SOC 2 Type II certified and GDPR compliant.",
  },
  {
    q: "Do you offer a free trial for the Pro plan?",
    a: "Yes! Pro plan comes with a 7-day free trial — no credit card required. You'll only be charged after the trial period ends.",
  },
];

export function Pricing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#0F172A]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
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
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition-all"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 dark:opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span
              className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE] mb-5"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Pricing
            </span>
            <h1
              className="text-slate-900 dark:text-white mb-4"
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                lineHeight: 1.1,
              }}
            >
              Simple, Transparent Pricing
            </h1>
            <p
              className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8"
              style={{ fontSize: "18px", lineHeight: 1.7 }}
            >
              Start free. Upgrade when you need it. No hidden fees, no surprise
              charges.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map(
              (
                {
                  name,
                  tagline,
                  price,
                  originalPrice,
                  savePercent,
                  icon: Icon,
                  iconColor,
                  iconBg,
                  border,
                  highlight,
                  badge,
                  features,
                  cta,
                  ctaVariant,
                },
                i,
              ) => {
                const displayPrice = price;
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative rounded-2xl bg-white dark:bg-[#1E293B] border-2 ${border} p-7 ${highlight ? "shadow-2xl shadow-blue-500/10" : ""}`}
                  >
                    {/* Popular badge */}
                    {badge && (
                      <div
                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#2563EB] text-white"
                        style={{ fontSize: "11px", fontWeight: 700 }}
                      >
                        {badge}
                      </div>
                    )}

                    {/* Icon + Name */}
                    <div
                      className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-5`}
                    >
                      <Icon className="w-6 h-6" style={{ color: iconColor }} />
                    </div>
                    <h3
                      className="text-slate-900 dark:text-white mb-1"
                      style={{ fontSize: "20px", fontWeight: 800 }}
                    >
                      {name}
                    </h3>
                    <p
                      className="text-slate-500 dark:text-slate-400 mb-6"
                      style={{ fontSize: "13px" }}
                    >
                      {tagline}
                    </p>

                    {/* Price */}
                    <div className="mb-7">
                      {displayPrice === null ? (
                        <div>
                          <span
                            className="text-slate-900 dark:text-white"
                            style={{
                              fontSize: "36px",
                              fontWeight: 900,
                              letterSpacing: "-1px",
                            }}
                          >
                            Custom
                          </span>
                          <p
                            className="text-slate-400 mt-1"
                            style={{ fontSize: "13px" }}
                          >
                            Talk to our sales team
                          </p>
                        </div>
                      ) : displayPrice === 0 ? (
                        <div>
                          <span
                            className="text-slate-900 dark:text-white"
                            style={{
                              fontSize: "36px",
                              fontWeight: 900,
                              letterSpacing: "-1px",
                            }}
                          >
                            Free
                          </span>
                          <p
                            className="text-slate-400 mt-1"
                            style={{ fontSize: "13px" }}
                          >
                            Forever, no credit card needed
                          </p>
                        </div>
                      ) : (
                        <div>
                          {/* Original price with strikethrough */}
                          {originalPrice && (
                            <div className="flex items-baseline gap-1 mb-1">
                              <span
                                className="text-slate-400 line-through"
                                style={{ fontSize: "18px", fontWeight: 500 }}
                              >
                                {currencySymbol}
                                {originalPrice.toLocaleString("vi-VN")}
                              </span>
                              {savePercent && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                                  Save {savePercent}%
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span
                              className="text-slate-400"
                              style={{ fontSize: "20px", fontWeight: 600 }}
                            >
                              {currencySymbol}
                            </span>
                            <span
                              className="text-slate-900 dark:text-white"
                              style={{
                                fontSize: "42px",
                                fontWeight: 900,
                                letterSpacing: "-2px",
                                lineHeight: 1,
                              }}
                            >
                              {displayPrice?.toLocaleString("vi-VN")}
                            </span>
                            <span
                              className="text-slate-400"
                              style={{ fontSize: "14px" }}
                            >
                              vnd
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() =>
                        name === "Enterprise"
                          ? navigate("/contact")
                          : navigate("/register")
                      }
                      className={`w-full py-3 rounded-xl mb-7 transition-all ${
                        ctaVariant === "primary"
                          ? "bg-[#2563EB] hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/25"
                          : "border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                      style={{ fontSize: "14px", fontWeight: 700 }}
                    >
                      {cta}
                    </button>

                    {/* Features */}
                    <div className="space-y-3">
                      {features.map(({ text, included }) => (
                        <div
                          key={text}
                          className={`flex items-center gap-3 ${!included ? "opacity-40" : ""}`}
                        >
                          {included ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                          <span
                            className="text-slate-600 dark:text-slate-400"
                            style={{ fontSize: "13px" }}
                          >
                            {text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Trust / Security bar */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1220] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p
            className="text-center text-slate-400 dark:text-slate-500 mb-8"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Security & Compliance
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: "SOC 2 Type II",
                desc: "Certified infrastructure",
              },
              {
                icon: Eye,
                title: "GDPR Compliant",
                desc: "Privacy-first architecture",
              },
              {
                icon: Trash2,
                title: "Zero Data Retention",
                desc: "Files deleted in 60 seconds",
              },
              {
                icon: Shield,
                title: "TLS 1.3 Encryption",
                desc: "All transfers secured",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p
                    className="text-slate-900 dark:text-white"
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    {title}
                  </p>
                  <p className="text-slate-400" style={{ fontSize: "11px" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50 dark:bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-[#2563EB] dark:text-[#22D3EE]" />
            </div>
            <h2
              className="text-slate-900 dark:text-white mb-3"
              style={{
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Frequently Asked Questions
            </h2>
            <p
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "16px" }}
            >
              Can't find what you're looking for?{" "}
              <button
                onClick={() => navigate("/contact")}
                className="text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                style={{ fontWeight: 600 }}
              >
                Contact our team
              </button>
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <span
                    className="text-slate-900 dark:text-slate-200 pr-4"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    {q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-6 pb-5 border-t border-slate-100 dark:border-slate-700"
                  >
                    <p
                      className="text-slate-500 dark:text-slate-400 pt-4"
                      style={{ fontSize: "14px", lineHeight: 1.75 }}
                    >
                      {a}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#2563EB] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-white mb-4"
              style={{
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Start protecting yourself today
            </h2>
            <p
              className="text-blue-100 mb-8"
              style={{ fontSize: "16px", lineHeight: 1.7 }}
            >
              Free plan includes 3 scans per day — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/register")}
                className="px-7 py-3.5 rounded-xl bg-white text-[#2563EB] hover:bg-blue-50 transition-all hover:shadow-xl"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all"
                style={{ fontSize: "15px", fontWeight: 600 }}
              >
                Talk to Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="text-slate-900 dark:text-white"
              style={{ fontWeight: 700, fontSize: "15px" }}
            >
              Deep<span className="text-[#22D3EE]">Guard</span> AI
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "Home", action: () => navigate("/") },
              { label: "About", action: () => navigate("/about") },
              { label: "Privacy Policy", action: () => navigate("/privacy") },
              { label: "Contact", action: () => navigate("/contact") },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                {label}
              </button>
            ))}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              style={{ fontSize: "14px", fontWeight: 500 }}
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
          <p className="text-slate-400" style={{ fontSize: "12px" }}>
            © 2026 DeepGuard AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
