import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Home, ScanSearch } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(37,99,235,0.3) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#2563EB]/8 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white" style={{ fontWeight: 700, fontSize: '18px' }}>
            Deep<span className="text-[#22D3EE]">Guard</span> AI
          </span>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative inline-block"
          >
            <span
              style={{
                fontSize: '120px',
                fontWeight: 900,
                letterSpacing: '-4px',
                background: 'linear-gradient(135deg, #2563EB 0%, #22D3EE 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
              }}
            >
              404
            </span>
            {/* Scan line animation */}
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-[#22D3EE]/60"
              style={{ boxShadow: '0 0 12px #22D3EE' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </div>

        <h1 className="text-white mb-3" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Page Not Found
        </h1>
        <p className="text-slate-400 mb-8" style={{ fontSize: '15px', lineHeight: 1.7 }}>
          Our AI scanned every corner of the platform, but couldn't locate this page. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => navigate('/detect')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/30"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            <ScanSearch className="w-4 h-4" />
            Start Detection
          </button>
        </div>
      </motion.div>
    </div>
  );
}
