const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface PaymentData {
  paymentId: string;
  transactionCode: string;
  amount: number;
  paymentMethod: string;
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED"
    | "SUCCESS";
  createdAt: string;
  subscriptionId: string;
  subscriptionStatus: string;
  pricingPlanId: string;
  pricingPlanName: string;
  credits: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
}

export interface PaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data: PaymentData;
  timestamp: string;
}

export interface PaymentListItem {
  paymentId: string;
  transactionCode: string;
  amount: number;
  paymentMethod: string;
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED"
    | "SUCCESS";
  createdAt: string;
  subscriptionId: string;
  subscriptionStatus: string;
  pricingPlanId: string;
  pricingPlanName: string;
  credits: number;
}

export interface PaymentListResponse {
  success: boolean;
  code: string;
  message: string;
  data: PaymentListItem[];
  timestamp: string;
}

/**
 * GET /api/billing/payments/{paymentId}
 * Get payment details by ID
 */
export async function getPaymentById(
  paymentId: string,
  accessToken: string,
): Promise<PaymentResponse> {
  const response = await fetch(
    `${API_BASE_URL}/billing/payments/${paymentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch payment");
  }

  return data as PaymentResponse;
}

/**
 * GET /api/billing/payments/me
 * Get current user's payment history
 */
export async function getMyPayments(
  accessToken: string,
): Promise<PaymentListResponse> {
  const response = await fetch(`${API_BASE_URL}/billing/payments/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch payment history");
  }

  return data as PaymentListResponse;
}
