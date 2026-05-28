const API_BASE_URL =
  (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3000/api";

/* ────── Scan Jobs Types ────── */

export interface ScanJob {
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

export interface ScanJobsResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    content: ScanJob[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  timestamp: string;
}

export interface ErrorResponse {
  message: string;
  code: string;
  timestamp: string;
}

/**
 * Fetch all scan jobs (Admin)
 * GET /api/admin/scan-jobs/all
 */
export async function getScanJobs(
  accessToken: string,
  page: number = 0,
  size: number = 10,
  status?: string,
): Promise<ScanJobsResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (status) params.set("status", status);

  const response = await fetch(
    `${API_BASE_URL}/admin/scan-jobs/all?${params.toString()}`,
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
    throw new Error(error.message || "Failed to fetch scan jobs");
  }

  return data as ScanJobsResponse;
}

/* ────── Media Types ────── */

export interface AdminMediaItem {
  id: string;
  fileName: string;
  originalUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  userId: string;
  email: string;
}

export interface AdminMediaResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    content: AdminMediaItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  timestamp: string;
}

/**
 * Fetch all media (Admin)
 * GET /api/admin/media/all
 */
export async function getAdminMedia(
  accessToken: string,
  params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sort?: string[];
  },
): Promise<AdminMediaResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.sort && params.sort.length > 0) {
    params.sort.forEach((s) => query.append("sort", s));
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/media/all?${query.toString()}`,
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
    throw new Error(error.message || "Failed to fetch media");
  }

  return data as AdminMediaResponse;
}

/* ────── Detection Results Types ────── */

export interface DetectionResultItem {
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

export interface DetectionResultsResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    content: DetectionResultItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  timestamp: string;
}

/**
 * Fetch all detection results (Admin)
 * GET /api/admin/detection-results/all
 */
export async function getDetectionResults(
  accessToken: string,
  page: number = 0,
  size: number = 10,
  resultLabel?: string,
): Promise<DetectionResultsResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (resultLabel) params.set("resultLabel", resultLabel);

  const response = await fetch(
    `${API_BASE_URL}/admin/detection-results/all?${params.toString()}`,
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
    throw new Error(error.message || "Failed to fetch detection results");
  }

  return data as DetectionResultsResponse;
}
