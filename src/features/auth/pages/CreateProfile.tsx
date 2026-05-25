import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import {
  Shield,
  ArrowRight,
  Sun,
  Moon,
  User,
  Camera,
  X,
  Loader2,
  CheckCircle2,
  Cpu,
  Zap,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { useAuth } from "../context/AuthContext";
import { createUserProfile } from "../api/userProfilesApi";

const leftFeatures = [
  {
    icon: Shield,
    title: "Complete your identity",
    desc: "Profile helps us personalize your experience",
  },
  {
    icon: Cpu,
    title: "Multi-model AI engine",
    desc: "7 specialized models running in parallel",
  },
  {
    icon: Zap,
    title: "Results in under 30 seconds",
    desc: "Real-time processing with instant verdict",
  },
];

const leftStats = [
  { value: "98.7%", label: "Accuracy" },
  { value: "2.4M+", label: "Files Scanned" },
  { value: "50K+", label: "Users" },
];

export function CreateProfile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { accessToken, setProfile, fetchProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleAvatarSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setAvatar(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleAvatarSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarSelect(file);
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!accessToken) {
      toast.error("You must be logged in to create a profile.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createUserProfile(accessToken, {
        fullName: fullName.trim(),
        bio: bio.trim() || undefined,
        avatar: avatar || undefined,
      });

      if (response.success) {
        // Update profile in AuthContext
        setProfile(response.data);

        toast.success("Profile created successfully! Redirecting...");

        // Re-fetch profile to update context with full data
        try {
          await fetchProfile(accessToken);
        } catch {
          // Non-critical - profile was already set
        }

        setTimeout(() => {
          navigate("/detect", { replace: true });
        }, 600);
      }
    } catch (error) {
      let errorMessage = "Failed to create profile. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Toaster
        theme={theme}
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1E293B" : "#fff",
            border:
              theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            color: theme === "dark" ? "#e2e8f0" : "#0f172a",
            borderRadius: "12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
          },
        }}
      />

      {/* ── Left branded panel ── */}
      <div className="hidden lg:flex flex-col w-[460px] min-h-screen bg-[#060D1A] relative overflow-hidden p-12 flex-shrink-0">
        {/* Grid bg */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#2563EB]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 rounded-full bg-[#22D3EE]/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span
              className="text-white"
              style={{
                fontWeight: 700,
                fontSize: "17px",
                letterSpacing: "-0.3px",
              }}
            >
              Deep<span className="text-[#22D3EE]">Guard</span>
            </span>
            <span
              className="block text-slate-600"
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              AI Platform
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative flex-1 flex flex-col justify-center">
          <div className="mb-4">
            <span
              className="px-3 py-1 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE]"
              style={{ fontSize: "11px", fontWeight: 600 }}
            >
              One last step to get started
            </span>
          </div>
          <h2
            className="text-white mb-4"
            style={{
              fontSize: "28px",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            Set up your profile
          </h2>
          <p
            className="text-slate-400 mb-10"
            style={{ fontSize: "14px", lineHeight: 1.7 }}
          >
            Add your name and photo so your team can recognize you. You can
            always update these later in Settings.
          </p>

          {/* Features */}
          <div className="space-y-5">
            {leftFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#22D3EE]" />
                </div>
                <div>
                  <p
                    className="text-white mb-0.5"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-slate-500"
                    style={{ fontSize: "12px", lineHeight: 1.5 }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80">
          {leftStats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div
                className="text-white"
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                {value}
              </div>
              <div
                className="text-slate-500"
                style={{ fontSize: "11px", fontWeight: 500, marginTop: "2px" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-slate-50 dark:bg-[#0F172A]">
        <div className="w-full max-w-[440px]">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              ← Back to login
            </button>
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
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-[#2563EB]" />
              </div>
              <h1
                className="text-slate-900 dark:text-white mb-2"
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Create your profile
              </h1>
              <p
                className="text-slate-500 dark:text-slate-400"
                style={{ fontSize: "14px" }}
              >
                Set up your profile to continue using DeepGuard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Avatar Upload */}
              <div>
                <label
                  className="block mb-2 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Profile Photo
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    dragOver
                      ? "border-[#2563EB] bg-[#2563EB]/5"
                      : avatarPreview
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-slate-300 dark:border-slate-600 hover:border-[#2563EB]/50 dark:hover:border-[#22D3EE]/50 bg-white dark:bg-[#1E293B]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {avatarPreview ? (
                    <>
                      <div className="relative group">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/30"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAvatar();
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p
                        className="text-emerald-500 mt-3"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        Photo selected
                      </p>
                      <p
                        className="text-slate-400"
                        style={{ fontSize: "11px" }}
                      >
                        Tap to change
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                        <Camera className="w-7 h-7 text-slate-400" />
                      </div>
                      <p
                        className="text-slate-600 dark:text-slate-300"
                        style={{ fontSize: "14px", fontWeight: 600 }}
                      >
                        Upload a photo
                      </p>
                      <p
                        className="text-slate-400 mt-1 text-center"
                        style={{ fontSize: "12px" }}
                      >
                        Drag & drop or click to browse
                      </p>
                      <p
                        className="text-slate-400"
                        style={{ fontSize: "11px" }}
                      >
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  className="block mb-1.5 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label
                  className="block mb-1.5 text-slate-700 dark:text-slate-300"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all resize-none"
                  style={{ fontSize: "14px" }}
                />
                <p className="text-slate-400 mt-1" style={{ fontSize: "11px" }}>
                  {bio.length}/200 characters
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "15px", fontWeight: 700 }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Profile
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Skip option */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  toast.success(
                    "You can set up your profile later in Settings.",
                  );
                  navigate("/detect", { replace: true });
                }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Skip for now — I'll do this later
              </button>
            </div>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span
                className="text-slate-400 text-center"
                style={{ fontSize: "12px" }}
              >
                Your data is encrypted and secure
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
