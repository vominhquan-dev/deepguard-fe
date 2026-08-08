/**
 * Media API Types
 */

export interface DetectionData {
  prediction: string;
  confidence: number;
  aiGeneratedScore: number;
  notAiGeneratedScore: number;
  deepfakeScore: number;
  aiGeneratedAudioScore: number;
  notAiGeneratedAudioScore: number;
  attributedGenerator: string | null;
  isVideo: boolean;
}

export interface MediaUploadData {
  id: string;
  userId: string;
  fileName: string;
  originalUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  detection?: DetectionData;
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
