import { useState, useCallback } from 'react';
import { FileData, ProcessResult, ProcessOptions } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedFile(data.file);
      setProcessedResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const processFile = useCallback(async (options: ProcessOptions) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      setProcessedResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setProcessedResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const downloadFile = useCallback((downloadUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `${API_BASE}${downloadUrl}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const reset = useCallback(() => {
    setUploadedFile(null);
    setProcessedResult(null);
    setError(null);
  }, []);

  return {
    uploadedFile,
    processedResult,
    isUploading,
    isProcessing,
    error,
    uploadFile,
    processFile,
    downloadFile,
    reset,
  };
};