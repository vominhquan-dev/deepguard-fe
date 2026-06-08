import { useState, useCallback } from "react";
import { getUserProfile } from "../api/authApi";
import type { UserProfile } from "../types/auth";

interface UseUserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useUserProfile() {
  const [state, setState] = useState<UseUserProfileState>({
    profile: null,
    loading: false,
    error: null,
  });

  const fetchProfile = useCallback(async (token: string) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await getUserProfile(token);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          profile: response.data,
        }));
        return response.data;
      } else {
        throw new Error(response.message || "Failed to load profile");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load profile";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw err;
    }
  }, []);

  const clearProfile = useCallback(() => {
    setState({
      profile: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    fetchProfile,
    clearProfile,
  };
}
