/**
 * Authentication API Types
 */

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface TokenData extends Partial<UserInfo> {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  code: string;
  message: string;
  data: TokenData;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  timestamp: string;
  path?: string;
  errors?: Record<string, string[]> | null;
}

export class AuthError extends Error {
  code: string;
  timestamp: string;

  constructor(message: string, code: string, timestamp: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.timestamp = timestamp;
  }
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  status: string;
  verified: boolean;
}

export interface UserProfileResponse {
  success: boolean;
  code: string;
  message: string;
  data: UserProfile;
  timestamp: string;
}

export interface UserInfoResponse {
  success: boolean;
  code: string;
  message: string;
  data: UserInfo;
  timestamp: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  code: string;
  message: string;
  data?: any;
  timestamp: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  code: string;
  message: string;
  data?: TokenData;
  timestamp: string;
}
