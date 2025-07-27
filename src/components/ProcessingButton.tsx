import React from 'react';
import { Play, Loader2 } from 'lucide-react';

interface ProcessingButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

const ProcessingButton: React.FC<ProcessingButtonProps> = ({
  onClick,
  isProcessing,
  disabled
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <button
        onClick={onClick}
        disabled={disabled || isProcessing}
        className={`
          w-full md:w-auto px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform
          ${disabled || isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Play className="w-6 h-6 mr-3" />
            Start Processing
          </div>
        )}
      </button>
      
      {isProcessing && (
        <div className="mt-4">
          <div className="bg-green-100 rounded-full h-2 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full animate-pulse w-full"></div>
          </div>
          <p className="text-sm text-green-600 mt-2">Please wait while we process your file...</p>
        </div>
      )}
    </div>
  );
};

export default ProcessingButton;