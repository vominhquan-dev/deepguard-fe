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
  refreshToken as requestTokenRefresh,
  RefreshTokenError,
} from "../api/authApi";
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

const REFRESH_EARLY_MS = 60_000;

function getJwtExpirationMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(atob(base64)) as { exp?: unknown };
    return typeof parsed.exp === "number" ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

function needsRefresh(token: string): boolean {
  const expiration = getJwtExpirationMs(token);
  return expiration !== null && expiration - Date.now() <= REFRESH_EARLY_MS;
}

function isRejectedRefresh(error: unknown): boolean {
  return (
    error instanceof RefreshTokenError &&
    error.status >= 400 &&
    error.status < 500
  );
}

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
  const refreshPromiseRef = useRef<Promise<string> | null>(null);

  const logout = useCallback(() => {
    setProfile(null);
    setUserInfo(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  }, []);

  const persistAccessToken = useCallback((token: string) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
  }, []);

  const refreshSession = useCallback(async (): Promise<string> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const savedRefreshToken = localStorage.getItem("refreshToken");
    if (!savedRefreshToken) {
      logout();
      throw new Error("Refresh token is missing");
    }

    const refresh = async (token: string) => {
      const response = await requestTokenRefresh(token);
      const tokens = response.data;
      if (!response.success || !tokens?.accessToken || !tokens.refreshToken) {
        throw new Error("Refresh token response is invalid");
      }

      persistAccessToken(tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      return tokens.accessToken;
    };

    const refreshPromise = (async () => {
      try {
        return await refresh(savedRefreshToken);
      } catch (initialError) {
        // A different tab may have just rotated the shared refresh token.
        // Retry once with the newer value before considering the session invalid.
        const replacementToken = localStorage.getItem("refreshToken");
        if (replacementToken && replacementToken !== savedRefreshToken) {
          try {
            return await refresh(replacementToken);
          } catch (replacementError) {
            if (isRejectedRefresh(replacementError)) {
              logout();
            }
            throw replacementError;
          }
        }

        if (isRejectedRefresh(initialError)) {
          logout();
        }
        throw initialError;
      }
    })();

    refreshPromiseRef.current = refreshPromise;
    try {
      return await refreshPromise;
    } finally {
      refreshPromiseRef.current = null;
    }
  }, [logout, persistAccessToken]);

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

  // Restore a session after reload. An expired access token is renewed with the
  // long-lived, rotating refresh token instead of logging the user out.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (!storedAccessToken) {
        if (userInfo) logout();
        return;
      }

      try {
        let token = storedAccessToken;
        if (needsRefresh(token)) {
          token = await refreshSession();
        }

        if (!cancelled && !userInfo) {
          try {
            await fetchProfile(token);
          } catch {
            // Handles clock skew or an access token invalidated by the server.
            const renewedToken = await refreshSession();
            if (!cancelled) await fetchProfile(renewedToken);
          }
        }
      } catch (sessionError) {
        if (!cancelled) {
          setError(
            sessionError instanceof Error
              ? sessionError.message
              : i18n.t("errors.api.failedToLoadProfile"),
          );
        }
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [accessToken, fetchProfile, logout, refreshSession, userInfo]);

  // Renew proactively before expiry. Visibility handling covers a tab which
  // was asleep while the access token expired.
  useEffect(() => {
    if (!accessToken) return;

    const expiration = getJwtExpirationMs(accessToken);
    if (expiration === null) return;

    let retryTimeoutId: number | undefined;
    const refreshWhenNeeded = () => {
      if (needsRefresh(accessToken)) {
        refreshSession().catch(() => {
          // Keep the current UI on transient network failures. A rejected
          // refresh token is already cleared by refreshSession.
          retryTimeoutId = window.setTimeout(refreshWhenNeeded, 60_000);
        });
      }
    };

    const delay = Math.max(0, expiration - Date.now() - REFRESH_EARLY_MS);
    const timeoutId = window.setTimeout(refreshWhenNeeded, delay);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshWhenNeeded();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(timeoutId);
      if (retryTimeoutId !== undefined) window.clearTimeout(retryTimeoutId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [accessToken, refreshSession]);

  const handleSetAccessToken = useCallback((token: string | null) => {
    if (token) {
      persistAccessToken(token);
    } else {
      setAccessToken(null);
      localStorage.removeItem("accessToken");
    }
  }, [persistAccessToken]);

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
