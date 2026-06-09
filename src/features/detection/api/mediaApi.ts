import { MediaUploadResponse, type UploadProgress } from "../types/media";
import { AuthError, type ErrorResponse } from "../../auth/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Upload media file to server
 * @param file - File to upload
 * @param token - Authentication token
 * @param onProgress - Callback for upload progress
 */
export async function uploadMediaFile(
  file: File,
  token: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100;
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const data = JSON.parse(xhr.responseText) as MediaUploadResponse;
          resolve(data);
        } catch (error) {
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText) as ErrorResponse;
          reject(new AuthError(error.message, error.code, error.timestamp));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload request failed"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    xhr.open("POST", `${API_BASE_URL}/media/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}

/**
 * Delete uploaded media file
 * @param mediaId - Media file ID
 * @param token - Authentication token
 */
export async function deleteMediaFile(
  mediaId: string,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse;
    throw new AuthError(error.message, error.code, error.timestamp);
  }
}
