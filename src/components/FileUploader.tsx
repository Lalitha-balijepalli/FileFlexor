import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { isValidFileType, getFileIcon } from '../utils/fileUtils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  selectedFile?: File | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  isUploading,
  selectedFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragError(null);
  }, []);

  const validateFile = (file: File): string | null => {
    if (!isValidFileType(file.type)) {
      return 'Invalid file type. Only PDF, DOCX, PPTX, JPG, and PNG files are allowed.';
    }
    if (file.size > 50 * 1024 * 1024) {
      return 'File size must be less than 50MB.';
    }
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const error = validateFile(file);
    
    if (error) {
      setDragError(error);
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setDragError(error);
      return;
    }

    setDragError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  if (selectedFile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-3xl">{getFileIcon(selectedFile.type)}</span>
            <div>
              <p className="font-semibold text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!isUploading && (
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {isUploading && (
          <div className="mt-4">
            <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full animate-pulse w-full"></div>
            </div>
            <p className="text-sm text-blue-600 mt-2">Uploading...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
          }
          ${dragError ? 'border-red-400 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Drop your file here
        </h3>
        
        <p className="text-gray-600 mb-6">
          or click to browse from your computer
        </p>
        
        <label className="inline-block">
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png"
          />
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 cursor-pointer inline-block">
            Choose File
          </span>
        </label>
        
        <p className="text-sm text-gray-500 mt-4">
          Supported formats: PDF, DOCX, PPTX, JPG, PNG (Max 50MB)
        </p>
        
        {dragError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{dragError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;