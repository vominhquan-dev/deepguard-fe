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

export interface MediaUploadData {
  id: string;
  userId: string;
  fileName: string;
  originalUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
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
