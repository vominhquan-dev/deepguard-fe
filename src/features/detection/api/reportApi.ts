import i18n from "../../../shared/i18n/config";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Export scan report as PDF
 * GET /api/v1/reports/scan/{scanJobId}/pdf
 *
 * Triggers a browser download of the PDF file.
 */
export async function downloadScanReportPdf(
  scanJobId: string,
  accessToken: string,
  fileName: string = "deepguard-report.pdf",
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/reports/scan/${encodeURIComponent(scanJobId)}/pdf`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(i18n.t("errors.api.authRequired"));
    }
    if (response.status === 404) {
      throw new Error(i18n.t("errors.api.scanJobNotFound"));
    }
    throw new Error(i18n.t("errors.api.pdfGenerationFailed"));
  }

  // Convert response to blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
