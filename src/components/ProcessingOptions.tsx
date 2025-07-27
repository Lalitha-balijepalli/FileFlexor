import React, { useState, useEffect } from 'react';
import { Settings, Zap, RotateCw } from 'lucide-react';
import { Operation } from '../types';
import { getConversionOptions } from '../utils/fileUtils';

interface ProcessingOptionsProps {
  fileType: string;
  onOptionsChange: (operation: Operation, targetFormat?: string, quality?: number) => void;
}

const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  fileType,
  onOptionsChange
}) => {
  const [operation, setOperation] = useState<Operation>('compress');
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [quality, setQuality] = useState<number>(80);

  const conversionOptions = getConversionOptions(fileType);
  const canCompress = fileType.includes('image') || fileType.includes('pdf');
  const canConvert = conversionOptions.length > 0;

  useEffect(() => {
    if (!canCompress && canConvert) {
      setOperation('convert');
      setTargetFormat(conversionOptions[0]);
    } else if (canCompress && !canConvert) {
      setOperation('compress');
    }
  }, [fileType, canCompress, canConvert, conversionOptions]);

  useEffect(() => {
    onOptionsChange(operation, targetFormat || undefined, quality);
  }, [operation, targetFormat, quality, onOptionsChange]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">Processing Options</h3>
      </div>

      {/* Operation Selection */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700">Choose Operation:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canCompress && (
            <label className={`
              flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300
              ${operation === 'compress' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-blue-300'
              }
            `}>
              <input
                type="radio"
                name="operation"
                value="compress"
                checked={operation === 'compress'}
                onChange={(e) => setOperation(e.target.value as Operation)}
                className="sr-only"
              />
              <Zap className="w-5 h-5 mr-3" />
              <div>
                <div className="font-semibold">Compress</div>
                <div className="text-sm opacity-75">Reduce file size</div>
              </div>
            </label>
          )}

          {canConvert && (
            <label className={`
              flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300
              ${operation === 'convert' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-gray-200 hover:border-purple-300'
              }
            `}>
              <input
                type="radio"
                name="operation"
                value="convert"
                checked={operation === 'convert'}
                onChange={(e) => setOperation(e.target.value as Operation)}
                className="sr-only"
              />
              <RotateCw className="w-5 h-5 mr-3" />
              <div>
                <div className="font-semibold">Convert</div>
                <div className="text-sm opacity-75">Change format</div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Conversion Target Format */}
      {operation === 'convert' && conversionOptions.length > 0 && (
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-700">Target Format:</h4>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {conversionOptions.map((format) => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quality Slider for Images */}
      {operation === 'compress' && fileType.includes('image') && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Compression Quality:</h4>
          <div className="space-y-2">
            <input
              type="range"
              min="20"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Lower quality</span>
              <span className="font-semibold text-blue-600">{quality}%</span>
              <span>Higher quality</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingOptions;