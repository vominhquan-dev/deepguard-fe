import { useState, useCallback } from "react";
import { uploadMediaFile } from "../api/mediaApi";
import type {
  MediaUploadData,
  UploadProgress,
  DetectionData,
} from "../types/media";

interface UseMediaUploadState {
  file: File | null;
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  data: MediaUploadData | null;
  detection: DetectionData | null;
}

export function useMediaUpload() {
  const [state, setState] = useState<UseMediaUploadState>({
    file: null,
    uploading: false,
    progress: null,
    error: null,
    data: null,
    detection: null,
  });

  const upload = useCallback(async (file: File, token: string) => {
    setState((prev) => ({
      ...prev,
      file,
      uploading: true,
      error: null,
      data: null,
      detection: null,
    }));

    try {
      const response = await uploadMediaFile(file, token, (progress) => {
        setState((prev) => ({
          ...prev,
          progress,
        }));
      });

      if (response.success) {
        setState((prev) => ({
          ...prev,
          uploading: false,
          data: response.data,
          detection: response.data.detection ?? null,
          progress: { loaded: 100, total: 100, percentage: 100 },
        }));
        return response.data;
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: errorMessage,
      }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      file: null,
      uploading: false,
      progress: null,
      error: null,
      data: null,
      detection: null,
    });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}
