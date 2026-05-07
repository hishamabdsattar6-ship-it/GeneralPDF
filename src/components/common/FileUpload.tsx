import React, { useState, useCallback } from 'react';
import { UploadCloud, FileType, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  icon?: React.ReactNode;
}

export default function FileUpload({ onFileSelect, multiple = false, accept = 'application/pdf', icon }: FileUploadProps) {
  const { language } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files) as File[];
      // Optional: Filter by accept type if needed
      onFileSelect(multiple ? files : [files[0]]);
    }
  }, [onFileSelect, multiple]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      onFileSelect(multiple ? files : [files[0]]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all ${
        isDragging ? 'border-[var(--primary-blue)] bg-blue-50 dark:bg-blue-900/20' : 'border-[var(--border-color)] bg-[var(--header-bg)] hover:border-blue-300 dark:hover:border-blue-700'
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${
        isDragging ? 'bg-[var(--primary-blue)] text-white scale-110' : 'bg-blue-100 dark:bg-blue-900/50 text-[var(--primary-blue)]'
      }`}>
        {icon || <UploadCloud className="w-10 h-10" />}
      </div>
      <h3 className="text-2xl font-bold mb-2">
        {language === 'ar' ? 'اسحب وأفلت الملفات هنا' : 'Drag and drop files here'}
      </h3>
      <p className="text-[var(--text-muted)] mb-8 max-w-sm">
        {language === 'ar' 
          ? 'تتم جميع العمليات محلياً في متصفحك للحفاظ على خصوصية ملفاتك.' 
          : 'All processing happens locally in your browser to maintain your privacy.'}
      </p>
      
      <label className="cursor-pointer">
        <span className="px-8 py-3 bg-[var(--primary-blue)] text-white font-bold rounded-xl hover:bg-[var(--primary-blue-hover)] transition-colors inline-block shadow-lg">
          {language === 'ar' ? 'اختر الملفات' : 'Select Files'}
        </span>
        <input 
          type="file" 
          className="hidden" 
          multiple={multiple} 
          accept={accept} 
          onChange={handleChange} 
        />
      </label>
    </div>
  );
}
