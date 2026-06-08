import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, ArrowLeft } from "lucide-react";

export interface UnauthorizedProps {
  requiredRole?: string | string[];
}

export function Unauthorized({ requiredRole }: UnauthorizedProps) {
  const navigate = useNavigate();

  const roleText = Array.isArray(requiredRole)
    ? requiredRole.join(" or ")
    : requiredRole;

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-lg"
      >
        <div className="w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-red-500" />
        </div>

        <h1
          className="text-white mb-2"
          style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1.2 }}
        >
          Access Denied
        </h1>

        <p className="text-slate-400 mb-6" style={{ fontSize: "16px" }}>
          {roleText
            ? `This page requires ${roleText} role. Your account doesn't have the necessary permissions.`
            : "You don't have permission to access this page."}
        </p>

        <button
          onClick={() => navigate("/dashboard", { replace: true })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
