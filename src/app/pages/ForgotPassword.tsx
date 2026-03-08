import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { Shield, Mail, ArrowLeft, Sun, Moon, CheckCircle2, Send, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0F172A]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
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

      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Back to login */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-10"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>

        {/* Card */}
        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-8 shadow-xl shadow-slate-900/5">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-[#2563EB] dark:text-[#22D3EE]" />
                </div>

                {/* Header */}
                <h1 className="text-slate-900 dark:text-white mb-2" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Reset your password
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  Enter your registered email address and we'll send you a secure link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1.5 text-slate-700 dark:text-slate-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontSize: '15px', fontWeight: 700 }}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                      />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center mt-6 text-slate-400" style={{ fontSize: '12px' }}>
                  Remember your password?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                    style={{ fontWeight: 600 }}
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-4"
              >
                {/* Success icon with animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>

                <h2 className="text-slate-900 dark:text-white mb-3" style={{ fontSize: '22px', fontWeight: 800 }}>
                  Check your inbox
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-2" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  We've sent a password reset link to
                </p>
                <p className="text-slate-900 dark:text-white mb-6" style={{ fontSize: '14px', fontWeight: 700 }}>
                  {email}
                </p>
                <p className="text-slate-400 mb-8" style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  The link expires in 15 minutes. If you don't see it, check your spam folder.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => { setSent(false); setEmail(''); }}
                    className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Try a different email
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                    style={{ fontSize: '14px', fontWeight: 700 }}
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo at bottom */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: '13px', fontWeight: 600 }}>
            Deep<span className="text-[#22D3EE]">Guard</span> AI
          </span>
        </div>
      </div>
    </div>
  );
}
