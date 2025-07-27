import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import ProcessingOptions from './components/ProcessingOptions';
import ProcessingButton from './components/ProcessingButton';
import ResultSection from './components/ResultSection';
import { useFileUpload } from './hooks/useFileUpload';
import { Operation } from './types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<Operation>('compress');
  const [targetFormat, setTargetFormat] = useState<string | undefined>();
  const [quality, setQuality] = useState<number>(80);

  const {
    uploadedFile,
    processedResult,
    isUploading,
    isProcessing,
    error,
    uploadFile,
    processFile,
    downloadFile,
    reset,
  } = useFileUpload();

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    await uploadFile(file);
  }, [uploadFile]);

  const handleOptionsChange = useCallback(
    (newOperation: Operation, newTargetFormat?: string, newQuality?: number) => {
      setOperation(newOperation);
      setTargetFormat(newTargetFormat);
      setQuality(newQuality || 80);
    },
    []
  );

  const handleProcess = useCallback(async () => {
    if (!uploadedFile) return;

    await processFile({
      fileId: uploadedFile.id,
      operation,
      targetFormat,
      quality,
    });
  }, [uploadedFile, operation, targetFormat, quality, processFile]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    reset();
  }, [reset]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Section */}
          <section>
            <FileUploader
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              selectedFile={selectedFile}
            />
          </section>

          {/* Processing Options */}
          {uploadedFile && !processedResult && (
            <section>
              <ProcessingOptions
                fileType={uploadedFile.type}
                onOptionsChange={handleOptionsChange}
              />
            </section>
          )}

          {/* Processing Button */}
          {uploadedFile && !processedResult && (
            <section>
              <ProcessingButton
                onClick={handleProcess}
                isProcessing={isProcessing}
                disabled={!uploadedFile || isUploading}
              />
            </section>
          )}

          {/* Result Section */}
          <section>
            <ResultSection
              result={processedResult}
              error={error}
              onDownload={downloadFile}
              onReset={handleReset}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 FileFlexor. Built with React, TypeScript, and Node.js.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;