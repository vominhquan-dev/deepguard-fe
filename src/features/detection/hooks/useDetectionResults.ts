import { useState, useEffect, useCallback } from "react";
import {
  getUserDetectionResults,
  DetectionResultData,
} from "../api/detectionApi";
import { useAuth } from "../../auth/context/AuthContext";

interface UseDetectionResultsReturn {
  results: DetectionResultData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDetectionResults(): UseDetectionResultsReturn {
  const { accessToken } = useAuth();
  const [results, setResults] = useState<DetectionResultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!accessToken) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getUserDetectionResults(accessToken);
      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.message || "Failed to load detection results");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load detection results";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return { results, loading, error, refetch: fetchResults };
}
