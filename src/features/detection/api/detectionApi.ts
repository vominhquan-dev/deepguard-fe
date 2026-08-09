import i18n from "../../../shared/i18n/config";
import type { HiveFrameData } from "../types/media";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Detection result detail (single item returned by GET /detection-results/{scanJobId})
 */
export interface DetectionResultDetail {
  detectionResultId: string;
  scanJobId: string;
  email: string | null;
  mediaId: string;
  fileName: string;
  originalUrl: string;
  fakeScore: number;
  confidence: number;
  aiGeneratedScore?: number;
  notAiGeneratedScore?: number;
  deepfakeScore?: number;
  aiGeneratedAudioScore?: number;
  notAiGeneratedAudioScore?: number;
  attributedGenerator?: string | null;
  video: boolean;
  frames: HiveFrameData[];
  resultLabel: string;
  modelVersion?: string;
  processedAt: string;
}

export interface DetectionResultDetailResponse {
  success: boolean;
  code: string;
  message: string;
  data: DetectionResultDetail;
  timestamp: string;
}

export interface DetectionResultData {
  detectionResultId: string;
  scanJobId: string;
  email: string | null;
  mediaId: string;
  fileName: string;
  originalUrl: string;
  fakeScore: number;
  confidence: number;
  aiGeneratedScore?: number;
  notAiGeneratedScore?: number;
  deepfakeScore?: number;
  aiGeneratedAudioScore?: number;
  notAiGeneratedAudioScore?: number;
  attributedGenerator?: string | null;
  video: boolean;
  frames: HiveFrameData[];
  resultLabel: string;
  modelVersion?: string;
  processedAt: string;
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
 * Fetch a single detection result by scanJobId
 * GET /api/detection-results/{scanJobId}
 */
export async function getDetectionResultByScanJobId(
  scanJobId: string,
  accessToken: string,
): Promise<DetectionResultDetailResponse> {
  const response = await fetch(
    `${API_BASE_URL}/detection-results/${scanJobId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(
      error.message || i18n.t("errors.api.fetchDetectionResultFailed"),
    );
  }

  return data as DetectionResultDetailResponse;
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
    throw new Error(
      error.message || i18n.t("errors.api.fetchDetectionResultsFailed"),
    );
  }

  return data as DetectionResultsResponse;
}
