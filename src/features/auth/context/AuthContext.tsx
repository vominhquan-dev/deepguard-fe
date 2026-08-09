import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  getUserProfile,
  getUserInfo,
  logout as revokeRefreshToken,
  refreshToken as requestTokenRefresh,
} from "../api/authApi";
import type { UserProfile, UserInfo } from "../types/auth";

const REFRESH_BUFFER_MS = 60_000;

function getTokenExpiryTime(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const expiresAt = JSON.parse(json).exp;
    return typeof expiresAt === "number" ? expiresAt * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const expiresAt = getTokenExpiryTime(token);
  return expiresAt === null || expiresAt <= Date.now();
}

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
  const refreshInFlightRef = useRef<Promise<string> | null>(null);

  const logout = useCallback(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken && storedRefreshToken) {
      void revokeRefreshToken(storedAccessToken, storedRefreshToken).catch(
        () => undefined,
      );
    }

    setProfile(null);
    setUserInfo(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  }, []);

  const refreshSession = useCallback(async (): Promise<string> => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const refreshPromise = requestTokenRefresh(storedRefreshToken)
      .then((response) => {
        const tokens = response.data;
        if (!response.success || !tokens?.accessToken || !tokens.refreshToken) {
          throw new Error("Invalid refresh token response");
        }

        setAccessToken(tokens.accessToken);
        localStorage.setItem("accessToken", tokens.accessToken);
        // The backend rotates the refresh token, so the replacement must be persisted too.
        localStorage.setItem("refreshToken", tokens.refreshToken);
        return tokens.accessToken;
      })
      .finally(() => {
        refreshInFlightRef.current = null;
      });

    refreshInFlightRef.current = refreshPromise;
    return refreshPromise;
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
        err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore the session on page load. An expired access token can still be
  // exchanged for a new one while the refresh token remains valid.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      let token = localStorage.getItem("accessToken");

      if (!token) {
        logout();
        return;
      }

      try {
        if (isTokenExpired(token)) {
          token = await refreshSession();
        }

        await fetchProfile(token);
      } catch {
        if (!cancelled) {
          logout();
        }
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [fetchProfile, logout, refreshSession]);

  // Refresh one minute before expiry so an active session does not hit a 401.
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const expiresAt = getTokenExpiryTime(accessToken);
    const delay = Math.max((expiresAt ?? Date.now()) - Date.now() - REFRESH_BUFFER_MS, 0);
    const timeoutId = window.setTimeout(() => {
      void refreshSession().catch(logout);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [accessToken, logout, refreshSession]);

  // Browsers can pause timers in a background tab. Refresh on return before
  // the user makes another authenticated request.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        accessToken &&
        (isTokenExpired(accessToken) ||
          (getTokenExpiryTime(accessToken) ?? 0) - Date.now() <= REFRESH_BUFFER_MS)
      ) {
        void refreshSession().catch(logout);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [accessToken, logout, refreshSession]);

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
