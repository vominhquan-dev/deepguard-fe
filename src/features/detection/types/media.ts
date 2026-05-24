/**
 * Media API Types
 */

export interface MediaUploadData {
  id: string;
  userId: string;
  fileName: string;
  originalUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
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
