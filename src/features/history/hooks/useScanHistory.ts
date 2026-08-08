import { useState, useEffect, useCallback } from "react";
import {
  getUserScanJobs,
  getUserDetectionResults,
  ScanJobData,
  DetectionResultData,
  inferMediaType,
  formatFileSize,
} from "../api/scanJobsApi";
import { useAuth } from "../../auth/context/AuthContext";

export interface HistoryItem {
  id: string;
  scanJobId: string;
  name: string;
  type: "Video" | "Image" | "Audio";
  risk: number;
  verdict: string;
  date: string;
  size: string;
  status: string;
  originalUrl: string;
  confidence: number;
}

interface UseScanHistoryReturn {
  items: HistoryItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Maps detection result label to a display verdict
 */
function mapVerdict(label: string): string {
  switch (label?.toLowerCase()) {
    case "fake":
    case "deepfake":
      return "Deepfake";
    case "suspicious":
      return "Suspicious";
    case "authentic":
    case "real":
    default:
      return "Authentic";
  }
}

/**
 * Maps scan job status to a readable status
 */
function mapStatus(status: string): string {
  switch (status?.toLowerCase()) {
    case "completed":
    case "done":
      return "Completed";
    case "processing":
    case "in_progress":
      return "Processing";
    case "failed":
    case "error":
      return "Failed";
    case "pending":
    default:
      return "Pending";
  }
}

export function useScanHistory(): UseScanHistoryReturn {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!accessToken) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch both APIs in parallel
      const [scanJobsRes, detectionRes] = await Promise.allSettled([
        getUserScanJobs(accessToken),
        getUserDetectionResults(accessToken),
      ]);

      const scanJobs: ScanJobData[] =
        scanJobsRes.status === "fulfilled" && scanJobsRes.value.success
          ? scanJobsRes.value.data
          : [];

      const detectionResults: DetectionResultData[] =
        detectionRes.status === "fulfilled" && detectionRes.value.success
          ? detectionRes.value.data
          : [];

      // Merge: use detection results as primary, fall back to scan jobs
      if (detectionResults.length > 0) {
        const merged: HistoryItem[] = detectionResults.map((dr) => {
          const matchingJob = scanJobs.find(
            (sj) => sj.scanJobId === dr.scanJobId,
          );
          const fileSize = matchingJob ? 0 : 0; // Size not available from API yet

          const prediction = dr.resultLabel || "REAL";
          const fakeProb = dr.fakeScore ?? 0;
          const realProb = dr.confidence ?? 1;

          return {
            id: dr.detectionResultId,
            scanJobId: dr.scanJobId,
            name: dr.fileName,
            type: inferMediaType(dr.fileName),
            risk: Math.round(fakeProb * 100),
            verdict: mapVerdict(prediction),
            date: dr.processedAt
              ? dr.processedAt.split("T")[0]
              : new Date().toISOString().split("T")[0],
            size: formatFileSize(fileSize),
            status: "Completed",
            originalUrl: dr.originalUrl,
            confidence: Math.round(realProb * 100),
          };
        });

        setItems(merged);
      } else if (scanJobs.length > 0) {
        // Fall back to scan jobs only
        const mapped: HistoryItem[] = scanJobs.map((sj) => ({
          id: sj.scanJobId,
          scanJobId: sj.scanJobId,
          name: sj.fileName,
          type: inferMediaType(sj.fileName),
          risk: 0,
          verdict: mapStatus(sj.status),
          date: sj.startedAt
            ? sj.startedAt.split("T")[0]
            : new Date().toISOString().split("T")[0],
          size: "N/A",
          status: mapStatus(sj.status),
          originalUrl: sj.originalUrl,
          confidence: 0,
        }));

        setItems(mapped);
      } else {
        setItems([]);
        if (
          scanJobsRes.status === "rejected" &&
          detectionRes.status === "rejected"
        ) {
          setError("Failed to load scan history");
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load scan history";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { items, loading, error, refetch: fetchHistory };
}
