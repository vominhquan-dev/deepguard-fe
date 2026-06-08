import { motion } from "motion/react";
import {
  LockKeyhole,
  Trash2,
  UserX,
  BrainCircuit,
  ShieldCheck,
  BadgeCheck,
  Server,
  RefreshCw,
} from "lucide-react";

const pillars = [
  {
    icon: LockKeyhole,
    badge: "AES-256 + TLS 1.3",
    badgeBg: "bg-[#22D3EE]/10 border-[#22D3EE]/20 text-[#22D3EE]",
    title: "Encrypted During Processing",
    desc: "Your files are encrypted the moment they leave your browser using TLS 1.3 in transit. On our servers, all media is processed inside an AES-256 encrypted sandbox — no unencrypted byte ever touches our disk.",
    accent: "#22D3EE",
  },
  {
    icon: Trash2,
    badge: "Auto-delete in 24h",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    title: "Files Auto-Delete After 24 Hours",
    desc: "Media files are automatically and permanently purged from our systems within 24 hours of analysis — often within 60 seconds. No manual deletion needed. No backups, no archives, no exceptions.",
    accent: "#10B981",
  },
  {
    icon: UserX,
    badge: "Zero data sharing",
    badgeBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    title: "No Third-Party Data Sharing",
    desc: "We never sell, rent, or share your uploaded media or analysis results with any third party — including advertisers, data brokers, or government entities (unless compelled by lawful order, which we'll disclose).",
    accent: "#8B5CF6",
  },
  {
    icon: BrainCircuit,
    badge: "Privacy-first AI",
    badgeBg: "bg-blue-500/10 border-blue-500/20 text-[#2563EB]",
    title: "Privacy-First AI Architecture",
    desc: "Our AI models run on-premise in isolated compute clusters. No file is ever sent to a third-party AI provider (OpenAI, Google, etc.). All inference is performed locally on DeepGuard's own infrastructure.",
    accent: "#2563EB",
  },
];

export function SecurityTransparency() {
  return (
    <section className="relative overflow-hidden bg-[#060D1A] py-24">
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(37,99,235,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#2563EB]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#22D3EE]/6 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Live status indicator */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span
              className="text-emerald-400"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.06em",
              }}
            >
              Security Systems: All Operational
            </span>
          </div>

          <h2
            className="text-white mb-4"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            We Have Nothing to Hide.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #22D3EE 0%, #2563EB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Neither Will You.
            </span>
          </h2>
          <p
            className="text-slate-400 max-w-2xl mx-auto"
            style={{ fontSize: "17px", lineHeight: 1.75 }}
          >
            Every claim about how we handle your data is backed by auditable
            architecture, third-party certifications, and a legally binding
            privacy policy — not just marketing copy.
          </p>
        </motion.div>

        {/* Pillars grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {pillars.map(
            ({ icon: Icon, badge, badgeBg, title, desc, accent }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-7 rounded-2xl bg-slate-900/60 border border-slate-700/60 hover:border-slate-600 transition-all duration-300 overflow-hidden"
                style={{ backdropFilter: "blur(8px)" }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 20% 50%, ${accent}0A 0%, transparent 60%)`,
                  }}
                />

                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${accent}18`,
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: accent }} />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${badgeBg}`}
                  >
                    {badge}
                  </span>
                </div>

                <h3
                  className="text-white mb-3"
                  style={{ fontSize: "17px", fontWeight: 700 }}
                >
                  {title}
                </h3>
                <p
                  className="text-slate-400"
                  style={{ fontSize: "14px", lineHeight: 1.75 }}
                >
                  {desc}
                </p>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
                  }}
                />
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
