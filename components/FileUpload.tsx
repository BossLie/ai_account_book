import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onAnalyze: (files: File[]) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze, isAnalyzing }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      addFiles(newFiles);
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = () => {
    if (selectedFiles.length > 0) {
      onAnalyze(selectedFiles);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-brand-600" />
        上传账单截图
      </h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isAnalyzing}
        />
        <div className="flex flex-col items-center justify-center text-gray-500">
          <FileImage className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-sm font-medium">点击或拖拽上传图片</p>
          <p className="text-xs mt-1 text-gray-400">支持微信、支付宝、京东、美团等截图</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">已选择 {previews.length} 张图片:</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {previews.map((src, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-gray-200 group">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <button 
                        onClick={() => removeFile(idx)}
                        disabled={isAnalyzing}
                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
                ))}
            </div>
        </div>
      )}

      <button
        onClick={handleStartAnalysis}
        disabled={selectedFiles.length === 0 || isAnalyzing}
        className={`mt-4 w-full py-2.5 rounded-lg flex items-center justify-center font-medium transition-all ${
          selectedFiles.length === 0 || isAnalyzing
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg'
        }`}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            AI 正在分析账单...
          </>
        ) : (
          `开始识别 (${selectedFiles.length})`
        )}
      </button>
    </div>
  );
};

export default FileUpload;