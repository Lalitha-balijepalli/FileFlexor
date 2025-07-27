import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 mr-4" />
          <h1 className="text-4xl md:text-5xl font-bold">
            FileFlexor
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
          Compress & Convert Files Online
        </p>
        <p className="text-lg text-blue-200 mt-4 max-w-2xl mx-auto">
          Upload files like PDF, DOCX, PPT, JPG, PNG and compress or convert them easily.
        </p>
      </div>
    </header>
  );
};

export default Header;