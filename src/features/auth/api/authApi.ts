import {
  LoginRequest,
  LoginResponse,
  AuthError,
  UserProfileResponse,
  UserInfoResponse,
  type ErrorResponse,
} from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Login with email/username and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new AuthError(error.message, error.code, error.timestamp);
  }

  return data as LoginResponse;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(token: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: token }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}

/**
 * Logout user
 */
export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get current user profile
 */
export async function getUserProfile(
  token: string,
): Promise<UserProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/user-profiles/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new AuthError(error.message, error.code, error.timestamp);
  }

  return data as UserProfileResponse;
}

/**
 * Get current user info (role, email, username, etc)
 */
export async function getUserInfo(token: string): Promise<UserInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new AuthError(error.message, error.code, error.timestamp);
  }

  return data as UserInfoResponse;
}
