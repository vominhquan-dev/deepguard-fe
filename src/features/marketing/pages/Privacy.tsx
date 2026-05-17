import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Shield,
  Sun,
  Moon,
  ArrowLeft,
  Github,
  Lock,
  Eye,
  Trash2,
  Server,
  FileText,
  Bell,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    icon: Shield,
    content: `DeepGuard AI ("we," "our," "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our deepfake detection platform.

This policy applies to all users of our web application, API, and related services. By accessing or using DeepGuard AI, you agree to the terms of this Privacy Policy.

If you have any questions, please contact us at privacy@deepguard.ai.`,
  },
  {
    id: "data-collected",
    title: "2. Information We Collect",
    icon: FileText,
    content: `Account Information: When you register, we collect your name, email address, organization name, and role.

Uploaded Media Files: Files uploaded for deepfake detection are processed in real time. We do not permanently store the content of uploaded files. They are deleted from our servers immediately after analysis (within 60 seconds).

Usage Data: We collect anonymized data about how you use the platform — including pages visited, features used, and scan counts. This data is used to improve the service.

Technical Data: IP address, browser type, device information, and access timestamps are collected for security purposes and rate limiting.

Payment Information: If you subscribe to a paid plan, payment details are processed by our payment provider (Stripe) and are never stored on DeepGuard AI servers.`,
  },
  {
    id: "media-processing",
    title: "3. Media File Processing",
    icon: Server,
    content: `This is our most important privacy commitment:

• Files are processed in isolated, ephemeral sandboxes
• No human ever views your uploaded content
• Media files are cryptographically deleted within 60 seconds of analysis completion
• Scan results (risk score, verdict, metadata) are stored in your account history
• You may delete your scan history at any time from the History page
• We use industry-standard TLS 1.3 encryption for all file transfers
• No uploaded media is ever used to train our AI models without explicit consent`,
  },
  {
    id: "data-use",
    title: "4. How We Use Your Information",
    icon: Eye,
    content: `We use your information to:

• Provide and operate the DeepGuard AI platform
• Process deepfake detection requests and return results
• Send transactional emails (scan completion, security alerts)
• Improve platform performance and accuracy
• Detect and prevent fraud, abuse, and security incidents
• Comply with legal obligations
• Provide customer support

We do not sell, rent, or share your personal information with third parties for their own marketing purposes.`,
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    icon: Trash2,
    content: `Account Data: Retained for as long as your account is active. Upon account deletion, personal data is removed within 30 days.

Scan Results: Stored in your account history until you delete them or close your account.

Media Files: Deleted within 60 seconds of scan completion. No exceptions.

Usage Logs: Retained for 90 days for security monitoring purposes.

Backups: Encrypted backups are retained for up to 30 days.

You can request complete data deletion at any time by contacting privacy@deepguard.ai.`,
  },
  {
    id: "notifications",
    title: "6. Notifications & Communications",
    icon: Bell,
    content: `We may send you:

• Transactional emails: scan results, account alerts, security notifications (cannot be opted out of)
• Product updates: new features and improvements (opt-out available in Settings)
• Weekly reports: scan activity summaries (opt-out available in Settings)
• Marketing communications: only with explicit consent

You can manage all notification preferences from the Settings → Notifications page.`,
  },
  {
    id: "security",
    title: "7. Security",
    icon: Lock,
    content: `We implement comprehensive security measures including:

• SOC 2 Type II certified infrastructure
• TLS 1.3 encryption for all data in transit
• AES-256 encryption for data at rest
• Role-based access controls (RBAC) for all internal systems
• Regular penetration testing by third-party auditors
• Multi-factor authentication required for all internal staff
• Isolated sandbox environments for file processing

We maintain an incident response plan and will notify affected users within 72 hours of discovering a data breach.`,
  },
];

export function Privacy() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
              onClick={() => navigate(-1)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 mb-6">
            <Lock className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span
              className="text-[#22D3EE]"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Last updated: March 1, 2026
            </span>
          </div>
          <h1
            className="text-slate-900 dark:text-white mb-4"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            Privacy Policy
          </h1>
          <p
            className="text-slate-500 dark:text-slate-400 max-w-2xl"
            style={{ fontSize: "16px", lineHeight: 1.7 }}
          >
            We built DeepGuard AI with privacy as a core principle, not an
            afterthought. Here's exactly how we handle your data.
          </p>

          {/* Key commitments */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Trash2, label: "Files deleted in 60s", color: "#10B981" },
              { icon: Eye, label: "No human views content", color: "#2563EB" },
              {
                icon: Lock,
                label: "SOC 2 Type II certified",
                color: "#8B5CF6",
              },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span
                  className="text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Two column layout: TOC + Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sticky TOC */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-4">
              <p
                className="text-slate-500 dark:text-slate-400 mb-3"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Contents
              </p>
              <nav className="space-y-1">
                {sections.map(({ id, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    {title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {sections.map(({ id, title, icon: Icon, content }, i) => (
              <motion.div
                key={id}
                id={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-[#2563EB] dark:text-[#22D3EE]" />
                  </div>
                  <h2
                    className="text-slate-900 dark:text-white"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    {title}
                  </h2>
                </div>
                <div
                  className="text-slate-600 dark:text-slate-400 space-y-3"
                  style={{ fontSize: "14px", lineHeight: 1.75 }}
                >
                  {content.split("\n\n").map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Contact */}
            <div className="rounded-2xl bg-gradient-to-br from-[#2563EB] to-blue-800 p-6 text-white">
              <h2
                className="text-white mb-2"
                style={{ fontSize: "16px", fontWeight: 700 }}
              >
                Privacy Questions?
              </h2>
              <p
                className="text-blue-100 mb-4"
                style={{ fontSize: "14px", lineHeight: 1.7 }}
              >
                If you have questions about this Privacy Policy or want to
                exercise your data rights, please contact our Data Protection
                Officer.
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:privacy@deepguard.ai"
                  className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
                  style={{ fontSize: "14px" }}
                >
                  📧 privacy@deepguard.ai
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
                  style={{ fontSize: "14px" }}
                >
                  📍 DeepGuard AI, 100 Mission St, San Francisco, CA 94105
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

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
