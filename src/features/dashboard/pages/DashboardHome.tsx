import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import {
  ScanSearch,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Image as ImageIcon,
  Video,
  Mic,
  ArrowRight,
  ExternalLink,
  Bell,
  Cpu,
  Activity,
  Zap,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const scanTrend = [
  { day: "Mon", scans: 12 },
  { day: "Tue", scans: 19 },
  { day: "Wed", scans: 8 },
  { day: "Thu", scans: 24 },
  { day: "Fri", scans: 21 },
  { day: "Sat", scans: 15 },
  { day: "Sun", scans: 9 },
];

const recentScans = [
  {
    id: 1,
    name: "interview_clip.mp4",
    type: "Video",
    verdict: "Deepfake",
    risk: 87,
    date: "2 min ago",
  },
  {
    id: 2,
    name: "profile_photo.jpg",
    type: "Image",
    verdict: "Authentic",
    risk: 12,
    date: "1 hr ago",
  },
  {
    id: 3,
    name: "voice_msg.mp3",
    type: "Audio",
    verdict: "Suspicious",
    risk: 65,
    date: "3 hr ago",
  },
  {
    id: 4,
    name: "news_segment.mp4",
    type: "Video",
    verdict: "Deepfake",
    risk: 91,
    date: "Yesterday",
  },
  {
    id: 5,
    name: "headshot.png",
    type: "Image",
    verdict: "Authentic",
    risk: 8,
    date: "Yesterday",
  },
];

const alerts = [
  {
    msg: "High-risk deepfake detected in your last scan",
    time: "2m ago",
    color: "bg-red-500/10 border-red-500/20 text-red-500",
  },
  {
    msg: "Your weekly scan report is ready to download",
    time: "1h ago",
    color: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  },
  {
    msg: "Suspicious audio file requires manual review",
    time: "3h ago",
    color: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  },
];

const typeIcon: Record<string, any> = { Video, Image: ImageIcon, Audio: Mic };
const verdictStyle: Record<string, any> = {
  Deepfake: { bg: "bg-red-500/10", text: "text-red-500", icon: AlertTriangle },
  Suspicious: { bg: "bg-amber-500/10", text: "text-amber-500", icon: Clock },
  Authentic: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    icon: CheckCircle2,
  },
};

export function DashboardHome() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full bg-[#2563EB]" />
              <h1
                className="text-slate-900 dark:text-white"
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Overview
              </h1>
            </div>
            <p
              className="text-slate-500 dark:text-slate-400 ml-3"
              style={{ fontSize: "14px" }}
            >
              Wednesday, March 4, 2026 — Welcome back, Admin
            </p>
          </div>
          <button
            onClick={() => navigate("/detect")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
            style={{ fontSize: "14px", fontWeight: 700 }}
          >
            <ScanSearch className="w-4 h-4" />
            New Detection
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Scans",
              value: "2,847",
              sub: "+24 today",
              icon: Cpu,
              color: "#2563EB",
              bg: "bg-[#2563EB]/10",
              trend: "+8%",
            },
            {
              label: "Deepfakes Found",
              value: "987",
              sub: "34.7% detection rate",
              icon: AlertTriangle,
              color: "#EF4444",
              bg: "bg-red-500/10",
              trend: "+3%",
            },
            {
              label: "Authentic Files",
              value: "1,080",
              sub: "37.9% of all scans",
              icon: Shield,
              color: "#10B981",
              bg: "bg-emerald-500/10",
              trend: "-2%",
            },
            {
              label: "Avg Risk Score",
              value: "54.2%",
              sub: "Across all media types",
              icon: Activity,
              color: "#F59E0B",
              bg: "bg-amber-500/10",
              trend: "+3.1%",
            },
          ].map(({ label, value, sub, icon: Icon, color, bg, trend }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span
                    className="text-emerald-500"
                    style={{ fontSize: "11px", fontWeight: 700 }}
                  >
                    {trend}
                  </span>
                </div>
              </div>
              <p
                className="text-slate-900 dark:text-white mb-0.5"
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                }}
              >
                {value}
              </p>
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                {label}
              </p>
              <p
                className="text-slate-400 dark:text-slate-600 mt-0.5"
                style={{ fontSize: "11px" }}
              >
                {sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts + Recent row */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          {/* Scan trend chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2
                  className="text-slate-900 dark:text-white"
                  style={{ fontSize: "15px", fontWeight: 700 }}
                >
                  Scan Activity
                </h2>
                <p
                  className="text-slate-400 dark:text-slate-500"
                  style={{ fontSize: "13px" }}
                >
                  Files scanned this week
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span
                  className="text-emerald-500"
                  style={{ fontSize: "12px", fontWeight: 700 }}
                >
                  +18% vs last week
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={scanTrend}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  formatter={(val: number) => [val, "Scans"]}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#scanGrad)"
                  dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#22D3EE" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Alerts panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-400" />
                <h2
                  className="text-slate-900 dark:text-white"
                  style={{ fontSize: "15px", fontWeight: 700 }}
                >
                  Alerts
                </h2>
                <span
                  className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white"
                  style={{ fontSize: "10px", fontWeight: 800 }}
                >
                  3
                </span>
              </div>
              <button
                className="text-[#2563EB] dark:text-[#22D3EE]"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                Clear all
              </button>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`flex gap-3 p-3 rounded-xl border ${alert.color} bg-opacity-10`}
                >
                  <div className="flex-1">
                    <p
                      className="text-slate-700 dark:text-slate-300"
                      style={{ fontSize: "12px", lineHeight: 1.5 }}
                    >
                      {alert.msg}
                    </p>
                    <p
                      className="text-slate-400 mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      {alert.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
              <p
                className="text-slate-500 dark:text-slate-500 mb-3"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Quick Actions
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "Detect New File",
                    icon: ScanSearch,
                    action: () => navigate("/detect"),
                  },
                  {
                    label: "View Analytics",
                    icon: BarChart2,
                    action: () => navigate("/analytics"),
                  },
                  {
                    label: "Browse History",
                    icon: Clock,
                    action: () => navigate("/history"),
                  },
                ].map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                      <span
                        className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        {label}
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-700 group-hover:text-[#2563EB] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent scans table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#22D3EE]" />
              <h2
                className="text-slate-900 dark:text-white"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                Recent Scans
              </h2>
            </div>
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-1.5 text-[#2563EB] dark:text-[#22D3EE] hover:underline"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            {recentScans.map((scan, i) => {
              const TypeIcon = typeIcon[scan.type];
              const VStyle = verdictStyle[scan.verdict];
              const riskColor =
                scan.risk >= 70
                  ? "text-red-500"
                  : scan.risk >= 31
                    ? "text-amber-500"
                    : "text-emerald-500";
              const riskBar =
                scan.risk >= 70
                  ? "bg-red-500"
                  : scan.risk >= 31
                    ? "bg-amber-500"
                    : "bg-emerald-500";

              return (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="grid items-center px-6 py-3.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                  style={{
                    gridTemplateColumns: "1fr 80px 100px 120px 110px 80px",
                  }}
                  onClick={() => navigate("/results")}
                >
                  {/* File */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-slate-900 dark:text-slate-200 truncate"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        {scan.name}
                      </p>
                      <p
                        className="text-slate-400"
                        style={{ fontSize: "11px" }}
                      >
                        {scan.type}
                      </p>
                    </div>
                  </div>

                  {/* Risk */}
                  <div>
                    <span
                      className={`${riskColor}`}
                      style={{ fontSize: "13px", fontWeight: 800 }}
                    >
                      {scan.risk}%
                    </span>
                    <div className="mt-1 h-1 w-10 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${riskBar}`}
                        style={{ width: `${scan.risk}%` }}
                      />
                    </div>
                  </div>

                  {/* Verdict */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${VStyle.bg} w-fit`}
                  >
                    <VStyle.icon className={`w-3 h-3 ${VStyle.text}`} />
                    <span
                      className={`${VStyle.text}`}
                      style={{ fontSize: "11px", fontWeight: 700 }}
                    >
                      {scan.verdict}
                    </span>
                  </div>

                  {/* Date */}
                  <span
                    className="text-slate-400 dark:text-slate-500"
                    style={{ fontSize: "12px" }}
                  >
                    {scan.date}
                  </span>

                  {/* Model */}
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                    <span
                      className="text-slate-400 dark:text-slate-600"
                      style={{ fontSize: "11px" }}
                    >
                      7 AI Models
                    </span>
                  </div>

                  {/* View */}
                  <button
                    className="flex items-center gap-1 text-slate-300 dark:text-slate-700 group-hover:text-[#2563EB] dark:group-hover:text-[#22D3EE] transition-colors"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
