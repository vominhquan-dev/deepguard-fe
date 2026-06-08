const API_BASE_URL =
  (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface CreditsData {
  userId: string;
  remainingCredits: number;
  usedCredits: number;
}

export interface CreditsResponse {
  success: boolean;
  code: string;
  message: string;
  data: CreditsData;
  timestamp: string;
}

export interface ErrorResponse {
  message: string;
  code: string;
  timestamp: string;
}

/**
 * Fetch the current user's credit balance
 * GET /api/credits/me
 */
export async function getUserCredits(
  accessToken: string,
): Promise<CreditsResponse> {
  const response = await fetch(`${API_BASE_URL}/credits/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(error.message || "Failed to fetch credits");
  }

  return data as CreditsResponse;
}
