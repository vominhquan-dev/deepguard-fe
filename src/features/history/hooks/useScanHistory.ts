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
  const normalized = label?.toLowerCase() || "";
  if (
    ["fake", "deepfake", "ai_generated", "ai_generated_and_deepfake", "ai_generated_audio"].includes(
      normalized,
    )
  ) {
    return "Deepfake";
  }
  if (normalized === "suspicious") return "Suspicious";
  if (["authentic", "real", "human"].includes(normalized)) return "Authentic";
  return "Suspicious";
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
          // The API does not currently expose a result file size. Avoid showing a misleading "0 B".
          const fileSize: number | undefined = undefined;

          // Use flat API response fields
          const prediction = dr.resultLabel || "REAL";
          const fakeScore = dr.fakeScore ?? 0;
          const confidence = dr.confidence ?? 1;

          return {
            id: dr.detectionResultId,
            scanJobId: dr.scanJobId,
            name: dr.fileName,
            type: inferMediaType(dr.fileName),
            risk: Math.round(fakeScore * 100),
            verdict: mapVerdict(prediction),
            date: dr.processedAt
              ? dr.processedAt.split("T")[0]
              : new Date().toISOString().split("T")[0],
            size: fileSize == null ? "Không có dữ liệu" : formatFileSize(fileSize),
            status: "Completed",
            originalUrl: dr.originalUrl,
            confidence: Math.round(confidence * 100),
          };
        });

        // Sort by processedAt descending (newest first)
        const sorted = merged.sort((a, b) => {
          const dateA = detectionResults.find(
            (dr) => dr.detectionResultId === a.id,
          )?.processedAt;
          const dateB = detectionResults.find(
            (dr) => dr.detectionResultId === b.id,
          )?.processedAt;
          if (dateA && dateB) return dateB.localeCompare(dateA);
          if (dateA) return -1;
          if (dateB) return 1;
          return 0;
        });

        setItems(sorted);
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

        // Sort by startedAt descending (newest first)
        const sortedFallback = mapped.sort((a, b) => {
          const dateA = scanJobs.find((sj) => sj.scanJobId === a.id)?.startedAt;
          const dateB = scanJobs.find((sj) => sj.scanJobId === b.id)?.startedAt;
          if (dateA && dateB) return dateB.localeCompare(dateA);
          if (dateA) return -1;
          if (dateB) return 1;
          return 0;
        });

        setItems(sortedFallback);
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
