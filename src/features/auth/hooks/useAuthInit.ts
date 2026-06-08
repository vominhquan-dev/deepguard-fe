import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Hook to initialize auth state and load user info on app start or when token changes
 * Primary: Extract from login response
 * Fallback: Fetch from /api/auth/me if not available
 */
export function useAuthInit() {
  const { accessToken, userInfo, loading, fetchProfile } = useAuth();

  useEffect(() => {
    // If we have token but no userInfo, try to fetch it (fallback)
    if (accessToken && !userInfo) {
      console.log(
        "[useAuthInit] Token found but no userInfo, attempting to fetch from API...",
      );
      fetchProfile(accessToken).catch((err) => {
        console.warn("[useAuthInit] Failed to load profile from API:", err);
        // This is expected if /auth/me endpoint doesn't exist
        // User info should have been extracted from login response instead
      });
    }
  }, [accessToken, userInfo, fetchProfile]);

  return {
    isReady: !!userInfo || !accessToken,
    isAuthenticated: !!accessToken && !!userInfo,
    isLoading: loading,
  };
}
