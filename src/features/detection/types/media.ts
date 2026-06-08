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

export interface MediaUploadData {
  id: string;
  userId: string;
  fileName: string;
  originalUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  aiDetect?: AiDetectData;
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
