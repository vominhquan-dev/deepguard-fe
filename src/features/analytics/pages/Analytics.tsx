import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Image as ImageIcon,
  Video,
  Mic,
  BarChart3,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";

const weeklyData = [
  { day: "Mon", scans: 24, deepfakes: 7, authentic: 12 },
  { day: "Tue", scans: 31, deepfakes: 12, authentic: 15 },
  { day: "Wed", scans: 18, deepfakes: 5, authentic: 10 },
  { day: "Thu", scans: 45, deepfakes: 18, authentic: 22 },
  { day: "Fri", scans: 38, deepfakes: 14, authentic: 18 },
  { day: "Sat", scans: 22, deepfakes: 8, authentic: 11 },
  { day: "Sun", scans: 15, deepfakes: 4, authentic: 9 },
];

const typeDistribution = [
  { name: "Image", value: 42, fill: "#2563EB" },
  { name: "Video", value: 35, fill: "#22D3EE" },
  { name: "Audio", value: 23, fill: "#8B5CF6" },
];

const riskDistribution = [
  { name: "Authentic\n(0–30%)", value: 38, fill: "#10B981" },
  { name: "Suspicious\n(31–69%)", value: 27, fill: "#F59E0B" },
  { name: "Deepfake\n(70–100%)", value: 35, fill: "#EF4444" },
];

const trendData = [
  { month: "Oct", rate: 28 },
  { month: "Nov", rate: 31 },
  { month: "Dec", rate: 34 },
  { month: "Jan", rate: 39 },
  { month: "Feb", rate: 33 },
  { month: "Mar", rate: 37 },
];

const statsCards = [
  {
    label: "Total Scans",
    value: "2,847",
    sub: "+12% this month",
    trend: "up",
    icon: Activity,
    color: "#2563EB",
    bg: "bg-[#2563EB]/10",
  },
  {
    label: "Deepfakes Detected",
    value: "987",
    sub: "34.7% detection rate",
    trend: "up",
    icon: AlertTriangle,
    color: "#EF4444",
    bg: "bg-red-500/10",
  },
  {
    label: "Authentic Files",
    value: "1,080",
    sub: "37.9% of all scans",
    trend: "neutral",
    icon: ShieldCheck,
    color: "#10B981",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Avg. Risk Score",
    value: "54.2%",
    sub: "+3.1% vs last month",
    trend: "up",
    icon: BarChart3,
    color: "#F59E0B",
    bg: "bg-amber-500/10",
  },
];

const mostScanned = [
  { type: "Image", icon: ImageIcon, count: 1196, pct: 42, color: "#2563EB" },
  { type: "Video", icon: Video, count: 996, pct: 35, color: "#22D3EE" },
  { type: "Audio", icon: Mic, count: 655, pct: 23, color: "#8B5CF6" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-3 shadow-xl">
        <p
          className="text-slate-300 mb-2"
          style={{ fontSize: "12px", fontWeight: 600 }}
        >
          {label}
        </p>
        {payload.map((entry: any) => (
          <p
            key={entry.name}
            style={{ color: entry.color, fontSize: "13px", fontWeight: 700 }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Analytics() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-[#22D3EE]" />
            <h1
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Analytics
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            Platform-wide deepfake detection insights and trends
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map(
            ({ label, value, sub, trend, icon: Icon, color, bg }, i) => (
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
                  {trend === "up" ? (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span style={{ fontSize: "11px", fontWeight: 700 }}>
                        +12%
                      </span>
                    </div>
                  ) : trend === "down" ? (
                    <div className="flex items-center gap-1 text-red-500">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span style={{ fontSize: "11px", fontWeight: 700 }}>
                        -5%
                      </span>
                    </div>
                  ) : null}
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
                  className="text-slate-400 dark:text-slate-600 mt-1"
                  style={{ fontSize: "11px" }}
                >
                  {sub}
                </p>
              </motion.div>
            ),
          )}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          {/* Weekly scans bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-slate-900 dark:text-white"
                  style={{ fontSize: "16px", fontWeight: 700 }}
                >
                  Weekly Scan Activity
                </h2>
                <p
                  className="text-slate-400 dark:text-slate-500"
                  style={{ fontSize: "13px" }}
                >
                  Total scans vs deepfakes — last 7 days
                </p>
              </div>
              <div className="flex gap-4">
                {[
                  { label: "Total", color: "#2563EB" },
                  { label: "Deepfakes", color: "#EF4444" },
                  { label: "Authentic", color: "#10B981" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-slate-500 dark:text-slate-400"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barGap={4} barCategoryGap="30%">
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
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(37,99,235,0.05)" }}
                />
                <Bar
                  dataKey="scans"
                  name="Total"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
                <Bar
                  dataKey="deepfakes"
                  name="Deepfakes"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
                <Bar
                  dataKey="authentic"
                  name="Authentic"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Scan type distribution pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Scan Types
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-4"
              style={{ fontSize: "13px" }}
            >
              Distribution by media type
            </p>

            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val}%`, ""]}
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-2">
              {mostScanned.map(({ type, icon: Icon, count, pct, color }) => (
                <div key={type} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-3 h-3" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span
                        className="text-slate-700 dark:text-slate-300"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        {type}
                      </span>
                      <span
                        style={{ fontSize: "12px", fontWeight: 700, color }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Detection rate trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Deepfake Detection Rate
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-5"
              style={{ fontSize: "13px" }}
            >
              Monthly % of deepfakes detected — last 6 months
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, "Detection Rate"]}
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  fill="url(#rateGradient)"
                  dot={{ fill: "#EF4444", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Risk distribution pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
          >
            <h2
              className="text-slate-900 dark:text-white mb-1"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Risk Distribution
            </h2>
            <p
              className="text-slate-400 dark:text-slate-500 mb-4"
              style={{ fontSize: "13px" }}
            >
              Breakdown of verdicts across all scans
            </p>

            <div className="grid grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, ""]}
                    contentStyle={{
                      background: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                {riskDistribution.map(({ name, value, fill }) => (
                  <div key={name}>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: fill }}
                      />
                      <span
                        className="text-slate-600 dark:text-slate-400"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        {name.split("\n")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${value}%`, backgroundColor: fill }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: fill,
                        }}
                      >
                        {value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
