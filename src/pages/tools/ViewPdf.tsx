import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { Eye, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error worker url
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url';

// Configure the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function ViewPdfPage() {
  const { language, startLoading, stopLoading } = useAppStore();
  const t = translations[language];
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const handleFile = async (files: File[]) => {
    setFile(files[0]);
    setPageNum(1);
    setScale(1.0);
    startLoading(language === 'ar' ? 'جاري تحميل الملف...' : 'Loading file...');
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
        disableFontFace: true
      }).promise;
      setPdfDoc(pdf);
    } catch (e: any) {
      alert('Error loading PDF: ' + e.message);
    } finally {
      stopLoading();
    }
  };

  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current) return;
    
    startLoading(language === 'ar' ? 'جاري العرض...' : 'Rendering...');
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      
      try {
        await renderTask.promise;
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') {
            return; // ignore cancelled render exception
        }
        throw err;
      }
    } catch (e: any) {
      console.error('Error rendering page', e);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage();
    }
  }, [pdfDoc, pageNum, scale]);

  const changePage = (offset: number) => {
    if (pdfDoc) {
      setPageNum(prev => {
        const next = prev + offset;
        if (next >= 1 && next <= pdfDoc.numPages) return next;
        return prev;
      });
    }
  };

  const changeScale = (delta: number) => {
    setScale(prev => Math.max(0.2, Math.min(prev + delta, 3.0)));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!file && (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--primary-blue)] mb-2">{t.viewPdf}</h1>
            <p className="text-[var(--text-muted)]">{t.viewPdfDesc}</p>
          </div>
          <div className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm max-w-4xl mx-auto">
            <FileUpload onFileSelect={handleFile} accept="application/pdf" />
          </div>
        </>
      )}

      {file && pdfDoc && (
        <div className="flex flex-col h-[80vh] bg-[#525659] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)]">
          {/* Toolbar */}
          <div className="bg-[var(--header-bg)] border-b border-[var(--border-color)] p-4 flex flex-wrap gap-4 items-center justify-between z-10 shadow-sm relative">
            <div className="text-sm font-bold truncate max-w-xs">{file.name}</div>
            
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button onClick={() => changePage(-1)} disabled={pageNum <= 1} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50">
                <ChevronLeft className="w-5 h-5 rtl:hidden" />
                <ChevronRight className="w-5 h-5 ltr:hidden" />
              </button>
              <div className="px-3 font-mono text-sm">
                {pageNum} / {pdfDoc.numPages}
              </div>
              <button onClick={() => changePage(1)} disabled={pageNum >= pdfDoc.numPages} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50">
                <ChevronRight className="w-5 h-5 rtl:hidden" />
                <ChevronLeft className="w-5 h-5 ltr:hidden" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => changeScale(-0.2)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="font-mono text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => changeScale(0.2)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-[var(--border-color)] mx-2"></div>
              <button onClick={() => { setFile(null); setPdfDoc(null); }} className="text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg font-medium transition-colors">
                {language === 'ar' ? 'إغلاق الملف' : 'Close File'}
              </button>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#525659] relative">
            <canvas ref={canvasRef} className="shadow-lg max-w-full bg-white object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
