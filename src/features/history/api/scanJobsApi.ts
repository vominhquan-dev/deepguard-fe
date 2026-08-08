const API_BASE_URL =
  (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface ScanJobData {
  scanJobId: string;
  mediaId: string;
  email: string;
  fileName: string;
  originalUrl: string;
  errorLoggings: string;
  status: string;
  startedAt: string;
  finishedAt: string;
}

export interface DetectionResultData {
  detectionResultId: string;
  scanJobId: string;
  email: string;
  mediaId: string;
  fileName: string;
  originalUrl: string;
  fakeScore: number;
  confidence: number;
  resultLabel: string;
  modelVersion: string;
  processedAt: string;
}

export interface ScanJobsResponse {
  success: boolean;
  code: string;
  message: string;
  data: ScanJobData[];
  timestamp: string;
}

export interface DetectionResultsResponse {
  success: boolean;
  code: string;
  message: string;
  data: DetectionResultData[];
  timestamp: string;
}

export interface ErrorResponse {
  message: string;
  code: string;
  timestamp: string;
}

/**
 * Fetch the current user's scan jobs
 * GET /api/scan-jobs/me
 */
export async function getUserScanJobs(
  accessToken: string,
): Promise<ScanJobsResponse> {
  const response = await fetch(`${API_BASE_URL}/scan-jobs/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(error.message || "Failed to fetch scan jobs");
  }

  return data as ScanJobsResponse;
}

/**
 * Fetch the current user's detection results
 * GET /api/detection-results/me
 */
export async function getUserDetectionResults(
  accessToken: string,
): Promise<DetectionResultsResponse> {
  const response = await fetch(`${API_BASE_URL}/detection-results/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(error.message || "Failed to fetch detection results");
  }

  return data as DetectionResultsResponse;
}

/**
 * Infer media type from file name extension
 */
export function inferMediaType(fileName: string): "Video" | "Image" | "Audio" {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  const videoExts = ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"];
  const audioExts = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"];

  if (videoExts.includes(ext)) return "Video";
  if (audioExts.includes(ext)) return "Audio";
  return "Image";
}

/**
 * Format file size from bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${size} ${units[i]}`;
}
