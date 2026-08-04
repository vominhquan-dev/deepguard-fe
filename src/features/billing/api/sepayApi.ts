import i18n from "../../../shared/i18n/config";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface SePayCreateRequest {
  pricingPlanId: string;
}

export interface SePayPaymentData {
  paymentId: string;
  transactionCode: string;
  amount: number;
  status: string;
  planId: string;
  planName: string;
  credits: number;
  bankCode: string;
  bankAccountNo: string;
  bankAccountName: string;
  transferContent: string;
  qrUrl: string;
}

export interface SePayResponse {
  success: boolean;
  code: string;
  message: string;
  data: SePayPaymentData;
  timestamp: string;
}

/**
 * Create a SePay payment QR code for the given pricing plan
 */
export async function createSePayPayment(
  request: SePayCreateRequest,
  accessToken: string,
): Promise<SePayResponse> {
  const response = await fetch(
    `${API_BASE_URL}/billing/payments/sepay/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || i18n.t("errors.api.createPaymentFailed"));
  }

  return data as SePayResponse;
}
