import { useState, useEffect, useCallback } from "react";
import { getUserCredits, CreditsData } from "../api/creditsApi";
import { useAuth } from "../../auth/context/AuthContext";

interface UseCreditsReturn {
  credits: CreditsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCredits(): UseCreditsReturn {
  const { accessToken } = useAuth();
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!accessToken) {
      setCredits(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getUserCredits(accessToken);
      if (response.success) {
        setCredits(response.data);
      } else {
        setError(response.message || "Failed to load credits");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load credits";
      setError(msg);
      // Don't clear credits on error — keep stale data visible
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, error, refetch: fetchCredits };
}
