import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Shield,
  ArrowRight,
  Sun,
  Moon,
  Github,
  Linkedin,
  Twitter,
  Award,
  Globe,
  Users,
  Zap,
  Lock,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";

const team = [
  {
    name: "Dr. Elena Vasquez",
    role: "CEO & Co-Founder",
    bio: "Former AI researcher at MIT CSAIL. 12+ years in computer vision and adversarial ML.",
    avatar: "EV",
    gradient: "from-[#2563EB] to-[#22D3EE]",
  },
  {
    name: "James Okafor",
    role: "CTO & Co-Founder",
    bio: "Ex-Google Brain engineer. Specialist in GAN detection and large-scale ML infrastructure.",
    avatar: "JO",
    gradient: "from-[#8B5CF6] to-[#2563EB]",
  },
  {
    name: "Dr. Mei Lin",
    role: "Head of AI Research",
    bio: "PhD from Stanford AI Lab. Published 20+ papers on synthetic media detection.",
    avatar: "ML",
    gradient: "from-[#22D3EE] to-[#10B981]",
  },
  {
    name: "Ravi Sharma",
    role: "VP of Engineering",
    bio: "Built real-time media processing systems at Cloudflare and Netflix.",
    avatar: "RS",
    gradient: "from-[#F59E0B] to-[#EF4444]",
  },
];

const milestones = [
  {
    year: "2021",
    title: "Founded",
    desc: "DeepGuard AI started as a research project at MIT, targeting synthetic media threats.",
  },
  {
    year: "2022",
    title: "Seed Round",
    desc: "Raised $4M seed. First enterprise pilot with a major news network.",
  },
  {
    year: "2023",
    title: "Series A",
    desc: "$18M Series A led by Sequoia. Launched the public SaaS platform with 5,000+ users.",
  },
  {
    year: "2024",
    title: "Global Expansion",
    desc: "Expanded to 150+ countries. Reached 1M scans milestone. SOC 2 Type II certified.",
  },
  {
    year: "2025",
    title: "V2 Platform",
    desc: "Launched multi-modal AI engine v2.0 with 98.7% accuracy across image, video, and audio.",
  },
  {
    year: "2026",
    title: "Today",
    desc: "50,000+ professionals trust DeepGuard AI. Processing 100,000+ scans per day.",
  },
];

const values = [
  {
    icon: Lock,
    title: "Privacy First",
    desc: "We process your files in isolated sandboxes and delete them immediately after analysis. No data is ever sold or shared.",
    color: "#22D3EE",
  },
  {
    icon: Brain,
    title: "AI Transparency",
    desc: "Every verdict comes with a detailed explanation of why the AI flagged it — no black boxes, no unexplained decisions.",
    color: "#2563EB",
  },
  {
    icon: Globe,
    title: "Open Research",
    desc: "We publish our research, benchmark datasets, and model improvements to advance the entire field of deepfake detection.",
    color: "#8B5CF6",
  },
  {
    icon: Users,
    title: "Accessibility",
    desc: "Deepfake detection should not be gatekept. Our free tier ensures students, journalists, and NGOs have access.",
    color: "#10B981",
  },
];

const partners = [
  { name: "Reuters", type: "Media Partner" },
  { name: "Interpol", type: "Law Enforcement" },
  { name: "Stanford AI Lab", type: "Research Partner" },
  { name: "Cloudflare", type: "Infrastructure" },
  { name: "EU Disinformation Lab", type: "Policy Partner" },
  { name: "Meta AI", type: "Technology" },
];

export function About() {
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
              onClick={() => navigate("/dashboard")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition-all duration-200"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Go to Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#2563EB]/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 mb-6">
              <Award className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span
                className="text-[#22D3EE]"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                Founded 2021 · San Francisco, CA
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-900 dark:text-white mb-6"
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
            }}
          >
            Protecting Truth in the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #22D3EE 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Age of AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
            style={{ fontSize: "18px", lineHeight: 1.7 }}
          >
            DeepGuard AI was built by researchers and engineers who believe that
            synthetic media detection should be accessible to everyone — not
            just well-funded organizations. Our mission is to restore trust in
            digital content.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "2.4M+", label: "Files Analyzed" },
            { value: "50K+", label: "Active Users" },
            { value: "98.7%", label: "Model Accuracy" },
            { value: "150+", label: "Countries" },
          ].map(({ value, label }, i) => (
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
                  fontSize: "32px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                {value}
              </div>
              <div
                className="text-slate-500 dark:text-slate-500 mt-1"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission / Values */}
      <section className="py-24 bg-slate-50 dark:bg-[#0F172A]">
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
              Our Values
            </span>
            <h2
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              What We Stand For
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3
                  className="text-slate-900 dark:text-white mb-2"
                  style={{ fontSize: "17px", fontWeight: 700 }}
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

      {/* Timeline */}
      <section className="py-24 bg-white dark:bg-[#0C1220]">
        <div className="max-w-4xl mx-auto px-6">
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
              History
            </span>
            <h2
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Our Journey
            </h2>
          </motion.div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#2563EB] via-[#22D3EE] to-transparent opacity-30" />
            <div className="space-y-8">
              {milestones.map(({ year, title, desc }, i) => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative flex gap-6 pl-16"
                >
                  {/* Dot */}
                  <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white dark:border-[#0C1220] shadow-lg shadow-blue-500/30 flex-shrink-0 -translate-x-1/2" />
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE]"
                        style={{ fontSize: "12px", fontWeight: 700 }}
                      >
                        {year}
                      </span>
                      <span
                        className="text-slate-900 dark:text-white"
                        style={{ fontSize: "16px", fontWeight: 700 }}
                      >
                        {title}
                      </span>
                    </div>
                    <p
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "14px", lineHeight: 1.7 }}
                    >
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-slate-50 dark:bg-[#0F172A]">
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
              Leadership
            </span>
            <h2
              className="text-slate-900 dark:text-white mb-4"
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              The Team Behind DeepGuard
            </h2>
            <p
              className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              style={{ fontSize: "16px", lineHeight: 1.7 }}
            >
              World-class researchers, engineers, and security experts united by
              one mission.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, bio, avatar, gradient }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-[#2563EB]/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 text-center"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4`}
                >
                  <span
                    className="text-white"
                    style={{ fontSize: "20px", fontWeight: 800 }}
                  >
                    {avatar}
                  </span>
                </div>
                <h3
                  className="text-slate-900 dark:text-white mb-1"
                  style={{ fontSize: "15px", fontWeight: 700 }}
                >
                  {name}
                </h3>
                <p
                  className="text-[#2563EB] dark:text-[#22D3EE] mb-3"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  {role}
                </p>
                <p
                  className="text-slate-500 dark:text-slate-400"
                  style={{ fontSize: "13px", lineHeight: 1.65 }}
                >
                  {bio}
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <a
                    href="#"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-white dark:bg-[#0C1220]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
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
              Trusted By
            </span>
            <h2
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Partners & Integrations
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map(({ name, type }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-center hover:border-[#2563EB]/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#22D3EE]" />
                </div>
                <p
                  className="text-slate-900 dark:text-white"
                  style={{ fontSize: "12px", fontWeight: 700 }}
                >
                  {name}
                </p>
                <p className="text-slate-400" style={{ fontSize: "10px" }}>
                  {type}
                </p>
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
              Join Our Mission
            </h2>
            <p
              className="text-blue-100 mb-8"
              style={{ fontSize: "16px", lineHeight: 1.7 }}
            >
              Start protecting yourself and your organization from synthetic
              media threats today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-7 py-3.5 rounded-xl bg-white text-[#2563EB] hover:bg-blue-50 transition-all hover:shadow-xl"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                Start Free Detection
              </button>
              <a
                href="mailto:contact@deepguard.ai"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all"
                style={{ fontSize: "15px", fontWeight: 600 }}
              >
                Contact Us
              </a>
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
