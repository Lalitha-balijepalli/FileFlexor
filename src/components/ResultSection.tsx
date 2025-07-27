import React from 'react';
import { Download, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { ProcessResult } from '../types';

interface ResultSectionProps {
  result: ProcessResult | null;
  error: string | null;
  onDownload: (downloadUrl: string, filename: string) => void;
  onReset: () => void;
}

const ResultSection: React.FC<ResultSectionProps> = ({
  result,
  error,
  onDownload,
  onReset
}) => {
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">Processing Failed</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={onReset}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-700 mb-2">Processing Complete!</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            <span className="font-semibold text-gray-800">{result.filename}</span>
          </div>
          <p className="text-sm text-gray-600">Size: {result.formattedSize}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onDownload(result.downloadUrl, result.filename)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <Download className="w-5 h-5 mr-2 inline" />
            Download Processed File
          </button>
          
          <button
            onClick={onReset}
            className="w-full bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Process Another File
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultSection;