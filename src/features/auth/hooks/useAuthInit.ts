import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Hook to initialize auth state and load profile on app start
 */
export function useAuthInit() {
  const { accessToken, profile, fetchProfile } = useAuth();

  useEffect(() => {
    if (accessToken && !profile) {
      fetchProfile(accessToken).catch((err) => {
        console.error("Failed to load profile on init:", err);
      });
    }
  }, [accessToken, profile, fetchProfile]);

  return {
    isReady: !!profile || !accessToken,
    isAuthenticated: !!accessToken && !!profile,
  };
}
