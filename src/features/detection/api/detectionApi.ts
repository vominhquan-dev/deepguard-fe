const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

export interface DetectionResultData {
  detectionResultId: string;
  scanJobId: string;
  email: string;
  mediaId: string;
  fileName: string;
  originalUrl: string;
  modelVersion?: string;
  processedAt: string;
  aiDetect?: {
    prediction: string;
    fakeProbability: number;
    realProbability: number;
    imageUrl: string | null;
    message: string | null;
  };
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
