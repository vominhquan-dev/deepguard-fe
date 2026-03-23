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
import { useTheme } from "../contexts/ThemeContext";

const plans = [
  {
    name: '1 month',
    tagline: 'Gói linh hoạt theo tháng',
    price: '199.000',
type Billing = "monthly";

const plans = [
  {
    name: "Free",
    tagline: "Ad-funded",
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Star,
    iconColor: "#10B981",
    iconBg: "bg-emerald-500/10",
    border: "border-slate-200 dark:border-slate-700",
    highlight: false,
    badge: null,
    features: [
      { text: 'Kích hoạt ngay', included: true },
      { text: 'Sử dụng trong 1 tháng', included: true },
      { text: 'Hỗ trợ tiêu chuẩn', included: true },
    ],
    cta: 'Chọn gói',
    ctaVariant: 'outline',
  },
  {
    name: '3 month',
    tagline: 'Tiết kiệm hơn so với gói tháng',
    price: '539.000',
      { text: "5 Credits/ngày (Free daily quota)", included: true },
      {
        text: "Hết lượt phải xem video quảng cáo để nhận thêm 1 lượt",
        included: true,
      },
      {
        text: "Giải quyết như cầu của 55.8% người dùng khảo sát",
        included: true,
      },
      { text: "Image & Audio detection", included: true },
      { text: "Basic analysis", included: true },
      { text: "Community support", included: true },
      { text: "Full technical breakdown", included: false },
      { text: "Downloadable PDF report", included: false },
      { text: "Video analysis", included: false },
      { text: "Priority analysis queue", included: false },
    ],
    cta: "Get Started Free",
    ctaVariant: "outline",
  },
  {
    name: "Premium",
    tagline: "Standard",
    monthlyPrice: 199000,
    annualPrice: 199000,
    icon: Zap,
    iconColor: "#2563EB",
    iconBg: "bg-[#2563EB]/10",
    border: "border-[#2563EB]",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: 'Sử dụng trong 3 tháng', included: true },
      { text: 'Chi phí tối ưu hơn', included: true },
      { text: 'Hỗ trợ tiêu chuẩn', included: true },
    ],
    cta: 'Chọn gói',
    ctaVariant: 'primary',
  },
  {
    name: '6 month',
    tagline: 'Cân bằng giữa chi phí và thời hạn',
    price: '1.019.000',
      { text: "500 Credits/tháng", included: true },
      {
        text: "Phù hợp cho cả nhân kinh doanh online thường xuyên gọi video cho khách lạ",
        included: true,
      },
      { text: "Image, Video & Audio detection", included: true },
      { text: "Full technical breakdown", included: true },
      { text: "Downloadable PDF reports", included: true },
      { text: "Priority analysis queue", included: true },
      { text: "Advanced AI features", included: true },
      { text: "24/5 email support", included: true },
      { text: "API access", included: false },
      { text: "Custom integrations", included: false },
    ],
    cta: "Nâng cấp lên Premium",
    ctaVariant: "primary",
  },
  {
    name: "Family",
    tagline: "Protection",
    monthlyPrice: 399000,
    annualPrice: 399000,
    icon: Building2,
    iconColor: "#8B5CF6",
    iconBg: "bg-purple-500/10",
    border: "border-slate-200 dark:border-slate-700",
    highlight: false,
    badge: null,
    features: [
      { text: 'Sử dụng trong 6 tháng', included: true },
      { text: 'Chi phí tiết kiệm hơn', included: true },
      { text: 'Hỗ trợ ưu tiên', included: true },
    ],
    cta: 'Chọn gói',
    ctaVariant: 'outline',
  },
  {
    name: '1 year',
    tagline: 'Giá tốt nhất cho nhu cầu dài hạn',
    price: '1.920.000',
    icon: Shield,
    iconColor: '#F59E0B',
    iconBg: 'bg-amber-500/10',
    border: 'border-slate-200 dark:border-slate-700',
    highlight: false,
    badge: null,
    features: [
      { text: 'Sử dụng trọn 12 tháng', included: true },
      { text: 'Tiết kiệm tối đa', included: true },
      { text: 'Hỗ trợ ưu tiên', included: true },
    ],
    cta: 'Chọn gói',
    ctaVariant: 'outline',
      { text: "1500 Credits dùng chung", included: true },
      { text: "Đặnh mạnh vào như cầu bảo vệ về gia đình", included: true },
      { text: "All media types", included: true },
      { text: "Unlimited file size", included: true },
      { text: "Family member invites", included: true },
      { text: "Shared analytics dashboard", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Custom alerts", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Family safety features", included: true },
    ],
    cta: "Nâng cấp lên Family",
    ctaVariant: "outline",
  },
];

const faqs = [
  {
    q: "Gói Free có thực sự miễn phí mãi mãi không?",
    a: "Đúng vậy. Gói Free hoàn toàn miễn phí không cần thẻ tín dụng. Bạn nhận được 5 Credits mỗi ngày. Khi hết lượt, bạn có thể xem video quảng cáo để nhận thêm 1 lượt. Nếu cần nhiều Credits hoặc tính năng nâng cao, bạn có thể nâng cấp sang Premium hoặc Family.",
  },
  {
    q: "Sự khác biệt giữa các gói What Premium và Family là gì?",
    a: "Gói Premium (199,000 VND/tháng) cung cấp 500 Credits phù hợp cho nhân kinh doanh online thường xuyên. Gói Family (399,000 VND/tháng) cung cấp 1500 Credits dùng chung, đặnh mạnh vào bảo vệ gia đình và có thể chia sẻ cho các thành viên trong gia đình.",
  },
  {
    q: "Tôi có thể hủy gói Premium hoặc Family bất cứ lúc nào không?",
    a: "Hoàn toàn có thể. Bạn có thể hủy đăng ký Premium hoặc Family bất cứ lúc nào từ Cài đặt → Thanh toán. Quyền truy cập sẽ tiếp tục cho đến hết chu kỳ thanh toán hiện tại, không có phí hủy.",
  },
  {
    q: "Những định dạng file nào được hỗ trợ?",
    a: "Tất cả các gói hỗ trợ JPG, PNG, WEBP (images), MP4, MOV, AVI (video), và MP3, WAV, M4A (audio). Gói Premium và Family hỗ trợ thêm các định dạng nâng cao.",
  },
  {
    q: "Dữ liệu tải lên của tôi có an toàn không?",
    a: "Vâng. Tất cả các tệp được xử lý trong sandbox riêng lẻ với mã hóa TLS 1.3. Các tệp này được xóa vĩnh viễn trong 60 giây sau khi phân tích hoàn tất. Chúng tôi được chứng nhận SOC 2 Type II và tuân thủ GDPR.",
  },
  {
    q: "Có dùng thử miễn phí cho gói Premium/Family không?",
    a: "Bạn có thể thử gói Premium với 3 ngày miễn phí (không cần thẻ tín dụng). Sau đó bạn sẽ bị tính phí hàng tháng nếu tiếp tục sử dụng.",
  },
];

export function Pricing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billing] = useState<Billing>("monthly");
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
              Ch\u1ecda c\u00f3 g\u00ec ph\u1ee9c t\u1ea1p. N\u0103ng c\u1ea5p
              khi b\u1ea1n c\u1ea7n. Kh\u00f4ng ph\u00ed \u1ea9n l\u1ea5u,
              kh\u00f4ng c\u00f3 ch\u1ee7ng ph\u00ed g\u00e0ng.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]">
              <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: '13px', fontWeight: 600 }}>
                Bảng giá gói dịch vụ
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map(({ name, tagline, price, icon: Icon, iconColor, iconBg, border, highlight, badge, features, cta, ctaVariant }, i) => {
              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl bg-white dark:bg-[#1E293B] border-2 p-7 transition-all duration-300 ${selectedPlan === name ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-2xl shadow-blue-500/20 -translate-y-1' : `${border} ${highlight ? 'shadow-2xl shadow-blue-500/10' : ''}`}`}
                >
                  {/* Popular badge */}
                  {badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#2563EB] text-white" style={{ fontSize: '11px', fontWeight: 700 }}>
                      {badge}
                    </div>
                  )}
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map(
              (
                {
                  name,
                  tagline,
                  monthlyPrice,
                  annualPrice,
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
                const displayPrice = monthlyPrice;
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative h-full rounded-2xl bg-white dark:bg-[#1E293B] border-2 ${border} p-7 flex flex-col ${highlight ? "shadow-2xl shadow-blue-500/10" : ""}`}
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
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-900 dark:text-white" style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>
                        {price}
                      </span>
                      <span className="text-slate-400" style={{ fontSize: '14px', fontWeight: 600 }}>vnd</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setSelectedPlan(name)}
                    className={`w-full py-3 rounded-xl mb-7 transition-all ${
                      selectedPlan === name
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/25'
                        : ctaVariant === 'primary'
                          ? 'bg-[#2563EB] hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/25'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    style={{ fontSize: '14px', fontWeight: 700 }}
                  >
                    {selectedPlan === name ? 'Đã chọn' : cta}
                  </button>

                  {selectedPlan === name && (
                    <div className="mb-5 px-3 py-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE] border border-[#2563EB]/20" style={{ fontSize: '12px', fontWeight: 700 }}>
                      Bạn đã chọn gói {name}
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-3">
                    {features.map(({ text, included }) => (
                      <div key={text} className={`flex items-center gap-3 ${!included ? 'opacity-40' : ''}`}>
                        {included ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="text-slate-600 dark:text-slate-400" style={{ fontSize: '13px' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
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
                          <div className="flex items-baseline gap-1">
                            <span
                              className="text-slate-400"
                              style={{ fontSize: "20px", fontWeight: 600 }}
                            >
                              VND
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
                              {displayPrice.toLocaleString("vi-VN")}
                            </span>
                            <span
                              className="text-slate-400"
                              style={{ fontSize: "14px" }}
                            >
                              /th\u00e1ng
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() =>
                        name === "Family"
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
                    <div className="space-y-3 flex-1">
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

          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 mx-auto max-w-xl rounded-2xl border border-[#2563EB]/30 bg-[#2563EB]/10 dark:bg-[#1E3A8A]/20 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <p className="text-slate-700 dark:text-slate-200" style={{ fontSize: '14px', fontWeight: 600 }}>
                Bạn đang chọn gói <span className="text-[#2563EB] dark:text-[#22D3EE]">{selectedPlan}</span>
              </p>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition-all"
                style={{ fontSize: '13px', fontWeight: 700 }}
              >
                Tiếp tục đăng ký
              </button>
            </motion.div>
          )}
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
              B\u1eaft \u0111\u1ea7u b\u1ea3o v\u1ec7 h\u00f4m nay
            </h2>
            <p
              className="text-blue-100 mb-8"
              style={{ fontSize: "16px", lineHeight: 1.7 }}
            >
              G\u00f3i Free bao g\u1ed3m 5 Credits m\u1ed7i ng\u00e0y \u2014
              kh\u00f4ng c\u1ea7n th\u1ebb t\u00edn d\u1ee5ng.
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
