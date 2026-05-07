import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import { 
  FileUp, 
  Trash2, 
  GripVertical, 
  Download, 
  Plus, 
  RotateCw,
  X,
  Loader2
} from 'lucide-react';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFPageItem {
  id: string;
  thumbnail: string;
  originalIndex: number;
  sourceFileId: string;
}

export default function OrganizePdf() {
  const { language } = useAppStore();
  const [pages, setPages] = useState<PDFPageItem[]>([]);
  const [files, setFiles] = useState<{ [key: string]: ArrayBuffer }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateThumbnails = async (arrayBuffer: ArrayBuffer, fileId: string) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const newPages: PDFPageItem[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        
        newPages.push({
          id: `${fileId}-${i}-${Math.random()}`,
          thumbnail: canvas.toDataURL('image/jpeg', 0.7),
          originalIndex: i - 1,
          sourceFileId: fileId
        });
      }
    }
    return newPages;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsLoading(true);
    try {
      const updatedFiles = { ...files };
      const allNewPages: PDFPageItem[] = [];

      const fileList = Array.from(uploadedFiles) as File[];
      for (const file of fileList) {
        const fileId = `${Date.now()}-${file.name}`;
        const buffer = await file.arrayBuffer();
        // Use slice(0) to create a copy and prevent detachment issues
        const bufferCopy = buffer.slice(0);
        updatedFiles[fileId] = bufferCopy;
        const thumbs = await generateThumbnails(bufferCopy.slice(0), fileId);
        allNewPages.push(...thumbs);
      }

      setFiles(updatedFiles);
      setPages(prev => [...prev, ...allNewPages]);
    } catch (err) {
      console.error('Error processing PDF:', err);
      alert('حدث خطأ أثناء معالجة ملف PDF');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pages];
    const draggedItem = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setPages(newPages);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  const downloadOrganizedPdf = async () => {
    if (pages.length === 0) return;
    setIsLoading(true);

    try {
      const mergedPdf = await PDFDocument.create();
      
      // Cache loaded documents to avoid re-parsing for every page
      const docCache: { [key: string]: PDFDocument } = {};

      for (const pageItem of pages) {
        if (!docCache[pageItem.sourceFileId]) {
          // Use slice(0) to ensure we're not using a detached buffer
          docCache[pageItem.sourceFileId] = await PDFDocument.load(files[pageItem.sourceFileId].slice(0));
        }
        
        const sourceDoc = docCache[pageItem.sourceFileId];
        const [copiedPage] = await mergedPdf.copyPages(sourceDoc, [pageItem.originalIndex]);
        mergedPdf.addPage(copiedPage);
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'organized_document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating PDF:', err);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">تنظيم ملفات PDF</h1>
          <p className="text-gray-600">قم بإعادة ترتيب الصفحات، حذفها، أو إضافة صفحات جديدة بسهولة.</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 md:gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-6 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-100 text-sm md:text-base"
            >
              <Plus className="w-5 h-5" />
              {language === 'ar' ? 'إضافة ملفات' : 'Add Files'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              multiple
              className="hidden"
            />
            {pages.length > 0 && (
              <button
                onClick={() => setPages([])}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 md:px-6 py-2.5 rounded-xl font-medium transition-all text-sm md:text-base"
              >
                <X className="w-5 h-5" />
                {language === 'ar' ? 'مسح الكل' : 'Clear All'}
              </button>
            )}
          </div>

          {pages.length > 0 && (
            <button
              onClick={downloadOrganizedPdf}
              disabled={isLoading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-green-100 disabled:opacity-50 text-sm md:text-base"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {language === 'ar' ? 'تحميل الملف' : 'Download File'}
            </button>
          )}
        </div>

        {/* Grid Area */}
        {isLoading && pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">جاري معالجة الصفحات...</p>
          </div>
        ) : pages.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
            {pages.map((page, index) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                className={`relative group bg-white border-2 rounded-xl p-2 transition-all cursor-move
                  ${draggedIndex === index ? 'opacity-40 border-indigo-500 scale-95' : 'hover:border-indigo-400 border-gray-100 shadow-sm hover:shadow-md'}`}
              >
                {/* Page Number Overlay */}
                <div className="absolute top-4 left-4 z-10 bg-gray-900/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <div className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-50 bg-gray-100">
                  <img src={page.thumbnail} alt={`Page ${index + 1}`} className="w-full h-full object-contain" />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-3 px-1">
                  <div className="text-gray-400">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => deletePage(page.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="حذف الصفحة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-gray-200 rounded-3xl bg-white hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="bg-indigo-50 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <FileUp className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ابدأ برفع ملف PDF</h3>
            <p className="text-gray-500 max-w-sm text-center">اسحب الملف هنا أو اضغط للاختيار من جهازك للبدء في تنظيم الصفحات.</p>
          </div>
        )}
      </div>
    </div>
  );
}
