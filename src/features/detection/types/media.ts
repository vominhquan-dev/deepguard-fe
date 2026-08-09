/**
 * Media API Types
 */

export interface AiDetectData {
  fakeProbability: number;
  prediction: string;
  realProbability: number;
  imageUrl: string | null;
  message: string | null;
}

/**
 * Frame-level detection result in a video
 */
export interface HiveFrameData {
  frameIndex: number;
  timestamp: number;
  aiGeneratedScore: number;
  notAiGeneratedScore: number;
  deepfakeScore: number;
  attributedGenerator: string;
  aiGeneratedAudioScore: number;
  notAiGeneratedAudioScore: number;
}

/**
 * Hive video detection result
 */
export interface HiveDetectData {
  prediction: string;
  confidence: number;
  aiGeneratedScore: number;
  notAiGeneratedScore: number;
  deepfakeScore: number;
  aiGeneratedAudioScore: number;
  notAiGeneratedAudioScore: number;
  attributedGenerator: string;
  frames: HiveFrameData[];
  taskId: string;
  mediaUrl: string;
  video: boolean;
}

/**
 * Canonical analysis payload returned by the backend for every media type.
 * The provider is intentionally not part of the user-facing contract.
 */
export interface MediaDetectionData {
  prediction: string;
  confidence: number;
  aiGeneratedScore: number;
  notAiGeneratedScore: number;
  deepfakeScore: number;
  aiGeneratedAudioScore: number;
  notAiGeneratedAudioScore: number;
  attributedGenerator: string | null;
  isVideo: boolean;
  frames: HiveFrameData[];
}

export interface MediaUploadData {
  id: string;
  scanJobId: string;
  userId: string;
  fileName: string;
  originalUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  detection?: MediaDetectionData | null;
  /** Internal UI adapters; never sent by the backend. */
  aiDetect?: AiDetectData | null;
  hiveDetect?: HiveDetectData | null;
}

export interface MediaUploadResponse {
  success: boolean;
  code: string;
  message: string;
  data: MediaUploadData;
  timestamp: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
