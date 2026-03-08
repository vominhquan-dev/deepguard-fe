import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import {
  Shield,
  Sun,
  Moon,
  ArrowLeft,
  Mail,
  MessageSquare,
  Github,
  Clock,
  CheckCircle2,
  Send,
  Building2,
  User,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const contactOptions = [
  {
    icon: MessageSquare,
    title: 'General Inquiry',
    desc: 'Questions about the platform, features, or your account',
    email: 'hello@deepguard.ai',
    color: '#2563EB',
  },
  {
    icon: Building2,
    title: 'Enterprise Sales',
    desc: 'Custom plans, API integration, and team onboarding',
    email: 'sales@deepguard.ai',
    color: '#22D3EE',
  },
  {
    icon: HelpCircle,
    title: 'Technical Support',
    desc: 'Platform issues, bug reports, and troubleshooting',
    email: 'support@deepguard.ai',
    color: '#8B5CF6',
  },
  {
    icon: Mail,
    title: 'Privacy & Legal',
    desc: 'Data requests, GDPR inquiries, and compliance',
    email: 'privacy@deepguard.ai',
    color: '#10B981',
  },
];

const faqItems = [
  {
    q: 'How quickly will I get a response?',
    a: 'Free plan users: within 2–3 business days. Pro users: within 24 hours. Enterprise users: within 4 hours via dedicated support channel.',
  },
  {
    q: 'Is there a live chat or phone support?',
    a: 'Enterprise plans include a dedicated Slack channel with the DeepGuard team. Phone support is available for Enterprise SLA customers.',
  },
  {
    q: 'How do I report a false positive/negative?',
    a: 'Use the "Report Issue" button on any scan result page, or email support@deepguard.ai with the scan ID. Our team reviews all reports to improve accuracy.',
  },
  {
    q: 'Can I request a demo or product walkthrough?',
    a: 'Yes! Email sales@deepguard.ai or use the Enterprise form below to schedule a personalized demo with our team.',
  },
];

export function Contact() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      toast.success('Message sent! We\'ll get back to you shortly.');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toaster
        theme={theme}
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1E293B' : '#fff',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
            color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
            borderRadius: '12px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
          },
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 dark:text-white" style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.4px' }}>
              Deep<span className="text-[#22D3EE]">Guard</span> <span className="text-slate-400 dark:text-slate-500" style={{ fontWeight: 400, fontSize: '14px' }}>AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 mb-6">
            <Zap className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="text-[#22D3EE]" style={{ fontSize: '12px', fontWeight: 600 }}>Average response time: 24 hours</span>
          </div>
          <h1 className="text-slate-900 dark:text-white mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Get in Touch
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto" style={{ fontSize: '16px', lineHeight: 1.7 }}>
            Have a question, need enterprise pricing, or want to report an issue? We're here to help.
          </p>
        </motion.div>

        {/* Contact options */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {contactOptions.map(({ icon: Icon, title, desc, email, color }, i) => (
            <motion.a
              key={title}
              href={`mailto:${email}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="block p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-lg group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-1" style={{ fontSize: '14px', fontWeight: 700 }}>{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-3" style={{ fontSize: '12px', lineHeight: 1.5 }}>{desc}</p>
              <span className="text-[#2563EB] dark:text-[#22D3EE] group-hover:underline" style={{ fontSize: '12px', fontWeight: 600 }}>{email}</span>
            </motion.a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-slate-900 dark:text-white mb-2" style={{ fontSize: '20px', fontWeight: 800 }}>Message Sent!</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6" style={{ fontSize: '14px', lineHeight: 1.7 }}>
                    We've received your message and will respond to <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', subject: 'General Inquiry', message: '' }); }}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-slate-900 dark:text-white mb-5" style={{ fontSize: '18px', fontWeight: 700 }}>Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1.5 text-slate-700 dark:text-slate-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <User className="inline w-3.5 h-3.5 mr-1.5 opacity-60" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="John Doe"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder-slate-400"
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-slate-700 dark:text-slate-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <Mail className="inline w-3.5 h-3.5 mr-1.5 opacity-60" />
                          Email *
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="john@company.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder-slate-400"
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-slate-700 dark:text-slate-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                        <Building2 className="inline w-3.5 h-3.5 mr-1.5 opacity-60" />
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Acme Corp (optional)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder-slate-400"
                        style={{ fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-slate-700 dark:text-slate-300" style={{ fontSize: '13px', fontWeight: 600 }}>Subject</label>
                      <select
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all cursor-pointer"
                        style={{ fontSize: '14px' }}
                      >
                        {['General Inquiry', 'Enterprise Sales', 'Technical Support', 'Bug Report', 'Privacy & Legal', 'Partnership'].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-slate-700 dark:text-slate-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                        <MessageSquare className="inline w-3.5 h-3.5 mr-1.5 opacity-60" />
                        Message *
                      </label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Tell us how we can help..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder-slate-400 resize-none"
                        style={{ fontSize: '14px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                      style={{ fontSize: '14px', fontWeight: 700 }}
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>

          {/* FAQ + Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-5"
          >
            {/* Response time card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#2563EB] to-blue-800 p-6 text-white">
              <h3 className="text-white mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>Response Times</h3>
              <div className="space-y-3">
                {[
                  { plan: 'Free Plan', time: '2–3 business days', icon: '🌱' },
                  { plan: 'Pro Plan', time: 'Within 24 hours', icon: '⚡' },
                  { plan: 'Enterprise', time: 'Within 4 hours (SLA)', icon: '🏢' },
                ].map(({ plan, time, icon }) => (
                  <div key={plan} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span className="text-blue-100" style={{ fontSize: '13px', fontWeight: 600 }}>{plan}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-blue-200" />
                      <span className="text-white" style={{ fontSize: '12px', fontWeight: 600 }}>{time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-slate-900 dark:text-white mb-4" style={{ fontSize: '14px', fontWeight: 700 }}>Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: 'View Documentation', icon: '📖', desc: 'API docs and integration guides' },
                  { label: 'System Status', icon: '🟢', desc: 'All systems operational' },
                  { label: 'GitHub Repository', icon: '💻', desc: 'Open source tools and SDKs' },
                  { label: 'Community Forum', icon: '💬', desc: 'Connect with other users' },
                ].map(({ label, icon, desc }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
                  >
                    <span className="text-lg">{icon}</span>
                    <div>
                      <p className="text-slate-900 dark:text-slate-200 group-hover:text-[#2563EB] dark:group-hover:text-[#22D3EE] transition-colors" style={{ fontSize: '13px', fontWeight: 600 }}>{label}</p>
                      <p className="text-slate-400" style={{ fontSize: '11px' }}>{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-slate-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 700 }}>Frequently Asked Questions</h3>
              </div>
              <div>
                {faqItems.map(({ q, a }, i) => (
                  <div key={i} className="border-b border-slate-100 dark:border-slate-700/60 last:border-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <span className="text-slate-900 dark:text-slate-200 pr-4" style={{ fontSize: '13px', fontWeight: 600 }}>{q}</span>
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${openFaq === i ? 'bg-[#2563EB] text-white rotate-45' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`} style={{ fontSize: '16px' }}>+</span>
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-5 pb-4"
                      >
                        <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: '13px', lineHeight: 1.7 }}>{a}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-900 dark:text-white" style={{ fontWeight: 700, fontSize: '15px' }}>
              Deep<span className="text-[#22D3EE]">Guard</span> AI
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'Home', action: () => navigate('/') },
              { label: 'About', action: () => navigate('/about') },
              { label: 'Privacy Policy', action: () => navigate('/privacy') },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" style={{ fontSize: '14px', fontWeight: 500 }}>{label}</button>
            ))}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" style={{ fontSize: '14px', fontWeight: 500 }}>
              <Github className="w-3.5 h-3.5" />GitHub
            </a>
          </div>
          <p className="text-slate-400" style={{ fontSize: '12px' }}>© 2026 DeepGuard AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
