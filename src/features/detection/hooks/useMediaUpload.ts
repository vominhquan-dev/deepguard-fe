import { useState, useCallback } from "react";
import { uploadMediaFile } from "../api/mediaApi";
import type {
  MediaUploadData,
  UploadProgress,
  AiDetectData,
  HiveDetectData,
  MediaDetectionData,
} from "../types/media";

interface UseMediaUploadState {
  file: File | null;
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  data: MediaUploadData | null;
  aiDetect: AiDetectData | null;
  hiveDetect: HiveDetectData | null;
}

export function useMediaUpload() {
  const [state, setState] = useState<UseMediaUploadState>({
    file: null,
    uploading: false,
    progress: null,
    error: null,
    data: null,
    aiDetect: null,
    hiveDetect: null,
  });

  const upload = useCallback(async (file: File, token: string) => {
    setState((prev) => ({
      ...prev,
      file,
      uploading: true,
      error: null,
      data: null,
      aiDetect: null,
      hiveDetect: null,
    }));

    try {
      const response = await uploadMediaFile(file, token, (progress) => {
        setState((prev) => ({
          ...prev,
          progress,
        }));
      });

      if (response.success) {
        const detection = response.data.detection ?? null;
        const normalizedData: MediaUploadData = {
          ...response.data,
          aiDetect: toImageDetection(detection, response.data.originalUrl),
          hiveDetect: toVideoDetection(detection, response.data.originalUrl),
        };
        setState((prev) => ({
          ...prev,
          uploading: false,
          data: normalizedData,
          aiDetect: normalizedData.aiDetect ?? null,
          hiveDetect: normalizedData.hiveDetect ?? null,
          progress: { loaded: 100, total: 100, percentage: 100 },
        }));
        return normalizedData;
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
      aiDetect: null,
      hiveDetect: null,
    });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}

function toImageDetection(
  detection: MediaDetectionData | null,
  originalUrl: string,
): AiDetectData | null {
  if (!detection || detection.isVideo) return null;

  return {
    prediction:
      detection.prediction === "NOT_AI_GENERATED" ? "REAL" : detection.prediction,
    fakeProbability: Math.max(
      detection.aiGeneratedScore ?? 0,
      detection.deepfakeScore ?? 0,
      detection.aiGeneratedAudioScore ?? 0,
    ),
    realProbability: detection.notAiGeneratedScore ?? detection.confidence ?? 0,
    imageUrl: originalUrl,
    message: null,
  };
}

function toVideoDetection(
  detection: MediaDetectionData | null,
  originalUrl: string,
): HiveDetectData | null {
  if (!detection || !detection.isVideo) return null;

  return {
    prediction: detection.prediction,
    confidence: detection.confidence ?? 0,
    aiGeneratedScore: detection.aiGeneratedScore ?? 0,
    notAiGeneratedScore: detection.notAiGeneratedScore ?? 0,
    deepfakeScore: detection.deepfakeScore ?? 0,
    aiGeneratedAudioScore: detection.aiGeneratedAudioScore ?? 0,
    notAiGeneratedAudioScore: detection.notAiGeneratedAudioScore ?? 0,
    attributedGenerator: detection.attributedGenerator ?? "",
    frames: detection.frames ?? [],
    taskId: "",
    mediaUrl: originalUrl,
    video: true,
  };
}
