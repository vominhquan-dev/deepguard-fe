import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { getUserProfile, getUserInfo } from "../api/authApi";
import i18n from "../../../shared/i18n/config";
import type { UserProfile, UserInfo } from "../types/auth";

interface AuthContextType {
  profile: UserProfile | null;
  userInfo: UserInfo | null;
  role: "USER" | "ADMIN" | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setAccessToken: (token: string | null) => void;
  fetchProfile: (token: string) => Promise<UserInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userInfo");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setProfile(null);
    setUserInfo(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  }, []);

  const fetchProfile = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both profile and user info from API independently
      // Handle failures individually so a profile failure doesn't block role info
      const [profileResult, userInfoResult] = await Promise.allSettled([
        getUserProfile(token),
        getUserInfo(token),
      ]);

      if (profileResult.status === "fulfilled" && profileResult.value.success) {
        setProfile(profileResult.value.data);
      } else {
        console.warn(
          "[AuthContext] getUserProfile failed (non-critical):",
          profileResult,
        );
      }

      if (
        userInfoResult.status === "fulfilled" &&
        userInfoResult.value.success
      ) {
        setUserInfo(userInfoResult.value.data);
        return userInfoResult.value.data;
      } else {
        console.error("[AuthContext] getUserInfo failed:", userInfoResult);
        throw new Error("Failed to fetch user info");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : i18n.t("errors.api.failedToLoadProfile");
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch user info from auth/me on mount if token exists (page refresh / initial load)
  useEffect(() => {
    const token = accessToken;

    if (token) {
      // If we already have userInfo from localStorage, verify it still matches
      // Otherwise fetch fresh data from API
      if (!userInfo) {
        fetchProfile(token).catch(() => {
          logout();
        });
      }
    } else {
      // No token, clear any stale userInfo
      if (userInfo) {
        logout();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetAccessToken = useCallback((token: string | null) => {
    setAccessToken(token);
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, []);

  const handleSetUserInfo = useCallback((userInfo: UserInfo | null) => {
    setUserInfo(userInfo);
    console.log("[AuthContext] UserInfo updated:", userInfo?.role);
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      localStorage.removeItem("userInfo");
    }
  }, []);

  const value: AuthContextType = {
    profile,
    userInfo,
    role: userInfo?.role || null,
    loading,
    error,
    accessToken,
    isAuthenticated: !!accessToken,
    setProfile,
    setUserInfo: handleSetUserInfo,
    setAccessToken: handleSetAccessToken,
    fetchProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
