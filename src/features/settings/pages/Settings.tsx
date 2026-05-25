import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  User,
  Bell,
  Shield,
  Palette,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  Camera,
  X,
  Loader2,
  CreditCard,
  Sparkles,
  Star,
  Clock,
  BarChart3,
  Zap,
  ShieldCheck,
  Headphones,
  Check,
  Globe,
} from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { updateUserProfile } from "../../../features/auth/api/userProfilesApi";

type Tab = "profile" | "notifications" | "security" | "api" | "appearance";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "Plan", icon: CreditCard },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const notifOptions = [
  {
    key: "deepfake_alert",
    label: "Deepfake Detected",
    desc: "Alert when a scan returns a high-risk verdict",
    defaultOn: true,
  },
  {
    key: "scan_complete",
    label: "Scan Complete",
    desc: "Notify when your file analysis is done",
    defaultOn: true,
  },
  {
    key: "weekly_report",
    label: "Weekly Report",
    desc: "Receive a weekly summary of your scan activity",
    defaultOn: false,
  },
  {
    key: "product_updates",
    label: "Product Updates",
    desc: "News about new features and improvements",
    defaultOn: false,
  },
];

const plans = [
  {
    id: "free",
    name: "Free Tier",
    badge: "Current Plan",
    price: "0",
    period: "forever",
    credits: "5 credits / day",
    icon: Sparkles,
    color: "from-slate-400 to-slate-500",
    features: [
      "5 credits per day",
      "Watch ads to earn +1 credit (daily)",
      "Basic image detection",
      "Community support",
    ],
    note: "Addresses the core needs of 55.8% of surveyed users.",
  },
  {
    id: "premium-1m",
    name: "Premium",
    badge: "1 Month",
    price: "199",
    period: "month",
    originalPrice: "299",
    credits: "500 credits",
    icon: Star,
    color: "from-[#2563EB] to-[#22D3EE]",
    popular: true,
    features: [
      "500 credits",
      "Image & Audio detection",
      "Priority processing",
      "Email support",
    ],
  },
  {
    id: "premium-3m",
    name: "Premium",
    badge: "3 Months",
    price: "539",
    period: "3 months",
    originalPrice: "597",
    saveLabel: "Save 10%",
    credits: "500 credits / month",
    icon: Star,
    color: "from-[#2563EB] to-[#22D3EE]",
    features: [
      "500 credits per month",
      "Image, Video & Audio detection",
      "PDF reports",
      "Priority support",
    ],
  },
  {
    id: "premium-6m",
    name: "Premium",
    badge: "6 Months",
    price: "1,019",
    period: "6 months",
    originalPrice: "1,194",
    saveLabel: "Save 15%",
    credits: "833 credits / month",
    icon: BarChart3,
    color: "from-violet-500 to-[#2563EB]",
    features: [
      "833 credits per month",
      "All media types",
      "PDF reports + API access",
      "Priority support",
      "Advanced analytics",
    ],
  },
  {
    id: "premium-1y",
    name: "Enterprise",
    badge: "1 Year",
    price: "1,920",
    period: "year",
    originalPrice: "2,388",
    saveLabel: "Save 20%",
    credits: "1000 credits / month",
    icon: ShieldCheck,
    color: "from-amber-500 to-rose-500",
    features: [
      "1000 credits per month",
      "All features included",
      "API access & Custom integrations",
      "24/7 Priority support",
      "Advanced analytics",
      "Dedicated account manager",
    ],
  },
];

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const {
    profile: authProfile,
    userInfo,
    accessToken,
    setProfile: setAuthProfile,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(notifOptions.map((n) => [n.key, n.defaultOn])),
  );
  const [profile, setProfile] = useState({
    name: authProfile?.fullName || userInfo?.username || "User",
    email: userInfo?.email || "",
    bio: authProfile?.bio || "",
    org: "DeepGuard Inc.",
    role: userInfo?.role === "ADMIN" ? "Administrator" : "User",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fakeApiKey = "dg_sk_live_7fK3mP9qZ2nA8rXv1cE6yB4wT5uN0jQ";

  // Sync profile form fields when auth context data loads
  useEffect(() => {
    if (authProfile?.fullName || userInfo?.email || userInfo?.role) {
      setProfile((prev) => ({
        ...prev,
        name: authProfile?.fullName || userInfo?.username || prev.name,
        email: userInfo?.email || prev.email,
        role: userInfo?.role === "ADMIN" ? "Administrator" : "User",
      }));
    }
  }, [authProfile, userInfo]);

  const handleAvatarSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!accessToken) {
      toast.error("You must be logged in to save your profile.");
      return;
    }

    if (!profile.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateUserProfile(accessToken, {
        fullName: profile.name.trim(),
        bio: profile.bio.trim() || undefined,
        avatar: avatarFile || undefined,
      });

      if (response.success) {
        setAuthProfile(response.data);
        toast.success("Profile saved successfully!");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(fakeApiKey).catch(() => {});
    toast.success("API key copied to clipboard");
  };

  const handleRegenerateKey = () => {
    toast.info("Generating new API key... (demo only)");
  };

  const currentPlan = "free"; // TODO: fetch from backend

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-slate-400 dark:bg-slate-600" />
            <h1
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Settings
            </h1>
          </div>
          <p
            className="text-slate-500 dark:text-slate-400 ml-3"
            style={{ fontSize: "14px" }}
          >
            Manage your account, preferences, and plan
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                    activeTab === id
                      ? "bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE]"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>
                    {label}
                  </span>
                  {activeTab === id && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile */}
              {activeTab === "profile" && (
                <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                  <h2
                    className="text-slate-900 dark:text-white mb-6"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    Profile Information
                  </h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarSelect(file);
                      }}
                      className="hidden"
                    />
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ring-2 ring-[#2563EB]/50"
                      />
                    ) : authProfile?.avatarUrl ? (
                      <img
                        src={authProfile.avatarUrl}
                        alt={profile.name}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center flex-shrink-0">
                        <span
                          className="text-white"
                          style={{ fontSize: "24px", fontWeight: 800 }}
                        >
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p
                        className="text-slate-900 dark:text-white mb-1"
                        style={{ fontSize: "16px", fontWeight: 700 }}
                      >
                        {profile.name}
                      </p>
                      <p
                        className="text-slate-400 dark:text-slate-500 mb-3"
                        style={{ fontSize: "13px" }}
                      >
                        {profile.email}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        >
                          <Camera className="w-3.5 h-3.5 inline mr-1.5" />
                          {avatarPreview ? "Change Photo" : "Upload Photo"}
                        </button>
                        {avatarPreview && (
                          <button
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview(null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            style={{ fontSize: "12px", fontWeight: 600 }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {avatarPreview && (
                        <p
                          className="text-emerald-500 mt-2"
                          style={{ fontSize: "11px", fontWeight: 600 }}
                        >
                          New photo ready to upload — save to apply
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Editable fields */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label
                        className="block mb-1.5 text-slate-700 dark:text-slate-300"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder-slate-400"
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label
                        className="block mb-1.5 text-slate-700 dark:text-slate-300"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, bio: e.target.value }))
                        }
                        placeholder="Tell us a little about yourself..."
                        rows={3}
                        maxLength={200}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all placeholder-slate-400 resize-none"
                        style={{ fontSize: "14px" }}
                      />
                      <p
                        className="text-slate-400 mt-1"
                        style={{ fontSize: "11px" }}
                      >
                        {profile.bio.length}/200 characters
                      </p>
                    </div>
                  </div>

                  {/* Read-only info */}
                  <div className="grid sm:grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div>
                      <p
                        className="text-slate-400 dark:text-slate-500"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        Email Address
                      </p>
                      <p
                        className="text-slate-900 dark:text-white mt-0.5"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        {profile.email}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-slate-400 dark:text-slate-500"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        Organization
                      </p>
                      <p
                        className="text-slate-900 dark:text-white mt-0.5"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        {profile.org}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-slate-400 dark:text-slate-500"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        Role
                      </p>
                      <p
                        className="text-slate-900 dark:text-white mt-0.5"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        {profile.role}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                  <h2
                    className="text-slate-900 dark:text-white mb-6"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    {notifOptions.map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <div>
                          <p
                            className="text-slate-900 dark:text-slate-200"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-slate-500 dark:text-slate-400 mt-0.5"
                            style={{ fontSize: "13px" }}
                          >
                            {desc}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setNotifs((n) => ({ ...n, [key]: !n[key] }));
                            toast.success(
                              `${label} notifications ${notifs[key] ? "disabled" : "enabled"}`,
                            );
                          }}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 mt-0.5 ${notifs[key] ? "bg-[#2563EB]" : "bg-slate-200 dark:bg-slate-700"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${notifs[key] ? "left-7" : "left-1"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
                    <p
                      className="text-slate-500 dark:text-slate-400 mb-3"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      Notification Channels
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Email",
                        "In-App",
                        "Slack (soon)",
                        "Webhook (soon)",
                      ].map((ch) => (
                        <span
                          key={ch}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${ch.includes("soon") ? "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600" : "border-[#2563EB]/30 bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE]"}`}
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === "security" && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                    <h2
                      className="text-slate-900 dark:text-white mb-5"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Change Password
                    </h2>
                    <div className="space-y-4 mb-5">
                      {[
                        "Current Password",
                        "New Password",
                        "Confirm New Password",
                      ].map((label) => (
                        <div key={label}>
                          <label
                            className="block mb-1.5 text-slate-700 dark:text-slate-300"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            {label}
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                            style={{ fontSize: "14px" }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        toast.success("Password updated successfully!")
                      }
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
                      style={{ fontSize: "14px", fontWeight: 700 }}
                    >
                      <Shield className="w-4 h-4" />
                      Update Password
                    </button>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                    <h2
                      className="text-slate-900 dark:text-white mb-1"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Two-Factor Authentication
                    </h2>
                    <p
                      className="text-slate-500 dark:text-slate-400 mb-5"
                      style={{ fontSize: "13px" }}
                    >
                      Add an extra layer of security to your account.
                    </p>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p
                            className="text-slate-900 dark:text-slate-200"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            2FA Enabled
                          </p>
                          <p
                            className="text-slate-500 dark:text-slate-400"
                            style={{ fontSize: "12px" }}
                          >
                            Authenticator app configured
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toast.info("2FA management coming soon")}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        Manage
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-red-500/20 p-6">
                    <h2
                      className="text-red-500 mb-1"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Danger Zone
                    </h2>
                    <p
                      className="text-slate-500 dark:text-slate-400 mb-4"
                      style={{ fontSize: "13px" }}
                    >
                      These actions are irreversible. Please proceed with
                      caution.
                    </p>
                    <button
                      onClick={() =>
                        toast.error(
                          "Account deletion requires email confirmation",
                        )
                      }
                      className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      style={{ fontSize: "13px", fontWeight: 700 }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Plan & Billing */}
              {activeTab === "api" && (
                <div className="space-y-6">
                  {/* Current plan summary */}
                  <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2
                          className="text-slate-900 dark:text-white mb-1"
                          style={{ fontSize: "16px", fontWeight: 700 }}
                        >
                          Your Plan
                        </h2>
                        <p
                          className="text-slate-500 dark:text-slate-400"
                          style={{ fontSize: "13px" }}
                        >
                          You are currently on the{" "}
                          <span className="text-slate-900 dark:text-white font-semibold">
                            Free Tier
                          </span>
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p
                          className="text-emerald-500"
                          style={{ fontSize: "12px", fontWeight: 700 }}
                        >
                          Active
                        </p>
                      </div>
                    </div>

                    {/* Credits today */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-[#2563EB]/5 to-[#22D3EE]/5 border border-[#2563EB]/20 mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <p
                          className="text-slate-700 dark:text-slate-300"
                          style={{ fontSize: "13px", fontWeight: 600 }}
                        >
                          <Zap className="w-3.5 h-3.5 inline mr-1.5 text-[#2563EB]" />
                          Credits Used Today
                        </p>
                        <span
                          className="text-slate-900 dark:text-white"
                          style={{ fontSize: "13px", fontWeight: 600 }}
                        >
                          2 / 5
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full w-[40%] rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
                          style={{ transition: "width 0.5s ease" }}
                        />
                      </div>
                      <p
                        className="text-slate-400 mt-2"
                        style={{ fontSize: "11px" }}
                      >
                        Resets in 12 hours · Watch an ad to earn +1 credit
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { label: "Total Credits Used", value: "47" },
                        { label: "Scans Performed", value: "32" },
                        { label: "Days Active", value: "14" },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                          <p
                            className="text-slate-500 dark:text-slate-400"
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-slate-900 dark:text-white mt-1"
                            style={{ fontSize: "18px", fontWeight: 800 }}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing plans */}
                  <div>
                    <h2
                      className="text-slate-900 dark:text-white mb-1"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Upgrade Your Plan
                    </h2>
                    <p
                      className="text-slate-500 dark:text-slate-400 mb-5"
                      style={{ fontSize: "13px" }}
                    >
                      Choose the plan that fits your needs
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrent = currentPlan === plan.id;
                        return (
                          <div
                            key={plan.id}
                            className={`relative rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-lg ${
                              isCurrent
                                ? "border-[#2563EB] bg-[#2563EB]/5 dark:bg-[#2563EB]/10"
                                : plan.popular
                                  ? "border-[#2563EB] bg-white dark:bg-[#1E293B]"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]"
                            }`}
                          >
                            {/* Popular badge */}
                            {plan.popular && !isCurrent && (
                              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE] text-white text-xs font-bold shadow-lg">
                                Most Popular
                              </div>
                            )}

                            {/* Current badge */}
                            {isCurrent && (
                              <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg">
                                Current
                              </div>
                            )}

                            {/* Plan header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                              >
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p
                                  className="text-slate-900 dark:text-white"
                                  style={{ fontSize: "15px", fontWeight: 700 }}
                                >
                                  {plan.name}
                                </p>
                                <p
                                  className="text-slate-500 dark:text-slate-400"
                                  style={{ fontSize: "11px", fontWeight: 600 }}
                                >
                                  {plan.badge}
                                </p>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="mb-3">
                              <div className="flex items-baseline gap-1">
                                {plan.originalPrice && (
                                  <span
                                    className="text-slate-400 line-through"
                                    style={{ fontSize: "14px" }}
                                  >
                                    {plan.originalPrice}₫
                                  </span>
                                )}
                                <span
                                  className="text-slate-900 dark:text-white"
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: 800,
                                    lineHeight: 1,
                                  }}
                                >
                                  {plan.price === "0"
                                    ? "Free"
                                    : `${plan.price}₫`}
                                </span>
                                <span
                                  className="text-slate-500 dark:text-slate-400"
                                  style={{ fontSize: "12px" }}
                                >
                                  /{plan.period}
                                </span>
                              </div>
                              {plan.saveLabel && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                                  {plan.saveLabel}
                                </span>
                              )}
                              <p
                                className="text-[#2563EB] mt-1"
                                style={{ fontSize: "12px", fontWeight: 600 }}
                              >
                                {plan.credits}
                              </p>
                            </div>

                            {/* Note for free tier */}
                            {plan.note && (
                              <p
                                className="text-slate-400 mb-3 italic"
                                style={{ fontSize: "11px" }}
                              >
                                {plan.note}
                              </p>
                            )}

                            {/* Features */}
                            <ul className="space-y-2 mb-5">
                              {plan.features.map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-start gap-2"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span
                                    className="text-slate-600 dark:text-slate-400"
                                    style={{ fontSize: "12px" }}
                                  >
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            {/* Action button */}
                            <button
                              onClick={() => {
                                if (isCurrent) {
                                  toast.info("You are already on this plan");
                                } else {
                                  toast.success(
                                    `Upgrading to ${plan.name} (${plan.badge}) — coming soon`,
                                  );
                                }
                              }}
                              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                                isCurrent
                                  ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                  : plan.popular
                                    ? "bg-[#2563EB] hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                              }`}
                              disabled={isCurrent}
                            >
                              {isCurrent ? "Current Plan" : "Upgrade"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment history */}
                  <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                    <h2
                      className="text-slate-900 dark:text-white mb-4"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Billing History
                    </h2>
                    <div className="p-8 text-center">
                      <CreditCard className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: "14px" }}
                      >
                        No billing history yet
                      </p>
                      <p
                        className="text-slate-400 dark:text-slate-600 mt-1"
                        style={{ fontSize: "12px" }}
                      >
                        Your invoices and receipts will appear here after your
                        first purchase.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === "appearance" && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                    <h2
                      className="text-slate-900 dark:text-white mb-5"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Theme
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "light",
                          label: "Light",
                          icon: Sun,
                          desc: "Clean white interface",
                          preview: "bg-white border-slate-200",
                        },
                        {
                          id: "dark",
                          label: "Dark",
                          icon: Moon,
                          desc: "Easy on the eyes",
                          preview: "bg-slate-900 border-slate-700",
                        },
                        {
                          id: "system",
                          label: "System",
                          icon: Monitor,
                          desc: "Follows OS setting",
                          preview:
                            "bg-gradient-to-r from-white to-slate-900 border-slate-400",
                        },
                      ].map(({ id, label, icon: Icon, desc, preview }) => (
                        <button
                          key={id}
                          onClick={() => {
                            if (id === "light" && theme === "dark")
                              toggleTheme();
                            else if (id === "dark" && theme === "light")
                              toggleTheme();
                            toast.success(`Switched to ${label} mode`);
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            id === theme || (id === "system" && false)
                              ? "border-[#2563EB] bg-[#2563EB]/5"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <div
                            className={`h-12 rounded-lg border mb-3 ${preview}`}
                          />
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span
                              className="text-slate-900 dark:text-white"
                              style={{ fontSize: "14px", fontWeight: 700 }}
                            >
                              {label}
                            </span>
                            {id === theme && (
                              <span
                                className="ml-auto px-2 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE]"
                                style={{ fontSize: "10px", fontWeight: 700 }}
                              >
                                Active
                              </span>
                            )}
                          </div>
                          <p
                            className="text-slate-500 dark:text-slate-400"
                            style={{ fontSize: "12px" }}
                          >
                            {desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                    <h2
                      className="text-slate-900 dark:text-white mb-1"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Accent Color
                    </h2>
                    <p
                      className="text-slate-500 dark:text-slate-400 mb-4"
                      style={{ fontSize: "13px" }}
                    >
                      Choose the highlight color for buttons and active states.
                    </p>
                    <div className="flex gap-3">
                      {[
                        {
                          color: "#2563EB",
                          label: "Electric Blue",
                          active: true,
                        },
                        { color: "#7C3AED", label: "Violet" },
                        { color: "#059669", label: "Emerald" },
                        { color: "#DC2626", label: "Red" },
                        { color: "#D97706", label: "Amber" },
                      ].map(({ color, label, active }) => (
                        <button
                          key={color}
                          onClick={() =>
                            toast.info(`${label} accent (demo only)`)
                          }
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${active ? "border-slate-900 dark:border-white scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: color }}
                          title={label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6">
                    <h2
                      className="text-slate-900 dark:text-white mb-1"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Language & Region
                    </h2>
                    <p
                      className="text-slate-500 dark:text-slate-400 mb-4"
                      style={{ fontSize: "13px" }}
                    >
                      Set your preferred language and date format.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: "Language", value: "English (US)" },
                        { label: "Date Format", value: "MM/DD/YYYY" },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <label
                            className="block mb-1.5 text-slate-700 dark:text-slate-300"
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            {label}
                          </label>
                          <div className="relative">
                            <select
                              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all cursor-pointer"
                              style={{ fontSize: "14px" }}
                              defaultValue={value}
                            >
                              <option>{value}</option>
                            </select>
                            <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
