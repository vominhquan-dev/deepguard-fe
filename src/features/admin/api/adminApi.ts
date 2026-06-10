const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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
  prediction?: string,
): Promise<DetectionResultsResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (prediction) params.set("prediction", prediction);

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

/* ────── User Management Types ────── */

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  isVerified: boolean;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetail extends AdminUser {
  bio: string;
  profileCreatedAt: string;
  totalScanJobs: number;
  totalMediaFiles: number;
  lastScanAt: string;
}

export interface AdminUsersResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    content: AdminUser[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  timestamp: string;
}

export interface AdminUserDetailResponse {
  success: boolean;
  code: string;
  message: string;
  data: AdminUserDetail;
  timestamp: string;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  pendingVerificationUsers: number;
  totalAdmins: number;
}

export interface AdminUserStatsResponse {
  success: boolean;
  code: string;
  message: string;
  data: AdminUserStats;
  timestamp: string;
}

export interface AdminActionResponse {
  success: boolean;
  code: string;
  message: string;
  data: string;
  timestamp: string;
}

/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 */
export async function getUsers(
  accessToken: string,
  params: {
    keyword?: string;
    status?: string;
    roleName?: string;
    page?: number;
    size?: number;
    sort?: string[];
  },
): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.roleName) query.set("roleName", params.roleName);
  if (params.sort && params.sort.length > 0) {
    params.sort.forEach((s) => query.append("sort", s));
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/users?${query.toString()}`,
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
    throw new Error(error.message || "Failed to fetch users");
  }

  return data as AdminUsersResponse;
}

/**
 * Get detailed information about a specific user
 * GET /api/admin/users/{userId}
 */
export async function getUserDetail(
  accessToken: string,
  userId: string,
): Promise<AdminUserDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(error.message || "Failed to fetch user details");
  }

  return data as AdminUserDetailResponse;
}

/**
 * Get high-level user statistics
 * GET /api/admin/users/stats
 */
export async function getUserStats(
  accessToken: string,
): Promise<AdminUserStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(error.message || "Failed to fetch user stats");
  }

  return data as AdminUserStatsResponse;
}

/**
 * Update a user's account status
 * PUT /api/admin/users/{userId}/status
 */
export async function updateUserStatus(
  accessToken: string,
  userId: string,
  status: string,
): Promise<AdminActionResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(error.message || "Failed to update user status");
  }

  return data as AdminActionResponse;
}

/**
 * Update a user's role
 * PUT /api/admin/users/{userId}/role
 */
export async function updateUserRole(
  accessToken: string,
  userId: string,
  roleName: string,
): Promise<AdminActionResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roleName }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(error.message || "Failed to update user role");
  }

  return data as AdminActionResponse;
}
