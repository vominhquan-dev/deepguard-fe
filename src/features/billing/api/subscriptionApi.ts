const API_BASE_URL =
  (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface CurrentSubscriptionData {
  subscriptionId: string | null;
  pricingPlanId: string;
  pricingPlanName: string;
  status: "FREE" | "ACTIVE";
  credits: number | null;
  startDate: string | null;
  endDate: string | null;
}

interface CurrentSubscriptionResponse {
  success: boolean;
  code: string;
  message: string;
  data: CurrentSubscriptionData;
  timestamp: string;
}

export async function getCurrentSubscription(
  accessToken: string,
): Promise<CurrentSubscriptionData> {
  const response = await fetch(
    `${API_BASE_URL}/billing/subscriptions/me/current`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  const payload = (await response.json()) as CurrentSubscriptionResponse;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Unable to load your current plan");
  }

  return payload.data;
}
