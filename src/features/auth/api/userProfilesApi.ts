import {
  UserProfileResponse,
  AuthError,
  type ErrorResponse,
} from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Create user profile with fullName, bio (optional) and avatar (optional)
 * POST /api/user-profiles
 */
export async function createUserProfile(
  token: string,
  data: {
    fullName: string;
    bio?: string;
    avatar?: File;
  },
): Promise<UserProfileResponse> {
  // Build URL with query params for fullName and bio
  const url = new URL(`${API_BASE_URL}/user-profiles`);
  url.searchParams.append("fullName", data.fullName);
  if (data.bio) url.searchParams.append("bio", data.bio);

  // Use FormData for avatar upload if provided
  const formData = new FormData();
  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type when using FormData - browser sets it with boundary
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    const error = result as ErrorResponse;
    throw new AuthError(error.message, error.code, error.timestamp);
  }

  return result as UserProfileResponse;
}

/**
 * Update user profile (fullName, bio, avatar)
 * PUT /api/user-profiles/me
 * fullName and bio are sent as query params, avatar as multipart/form-data
 */
export async function updateUserProfile(
  token: string,
  data: {
    fullName: string;
    bio?: string;
    avatar?: File;
  },
): Promise<UserProfileResponse> {
  // Build URL with query params for fullName and bio
  const url = new URL(`${API_BASE_URL}/user-profiles/me`);
  url.searchParams.append("fullName", data.fullName);
  if (data.bio) url.searchParams.append("bio", data.bio);

  // Use FormData for avatar upload if provided
  const formData = new FormData();
  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    const error = result as ErrorResponse;
    throw new AuthError(error.message, error.code, error.timestamp);
  }

  return result as UserProfileResponse;
}
