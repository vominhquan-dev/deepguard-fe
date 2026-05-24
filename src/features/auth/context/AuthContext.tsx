import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { getUserProfile, getUserInfo } from "../api/authApi";
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
  setAccessToken: (token: string | null) => void;
  fetchProfile: (token: string) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both profile and user info
      const [profileResponse, userInfoResponse] = await Promise.all([
        getUserProfile(token),
        getUserInfo(token),
      ]);

      if (profileResponse.success) {
        setProfile(profileResponse.data);
      }

      if (userInfoResponse.success) {
        setUserInfo(userInfoResponse.data);
      }

      return profileResponse.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setProfile(null);
    setUserInfo(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  const handleSetAccessToken = useCallback((token: string | null) => {
    setAccessToken(token);
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, []);

  const value: AuthContextType = {
    profile,
    userInfo,
    role: userInfo?.role || null,
    loading,
    error,
    accessToken,
    isAuthenticated: !!accessToken && !!profile,
    setProfile,
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
