export interface FileData {
  id: string;
  originalName: string;
  size: number;
  formattedSize: string;
  type: string;
}

export interface ProcessResult {
  filename: string;
  size: number;
  formattedSize: string;
  downloadUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type Operation = 'compress' | 'convert';

export interface ProcessOptions {
  fileId: string;
  operation: Operation;
  targetFormat?: string;
  quality?: number;
}

export interface ConversionOptions {
  [key: string]: string[];
}