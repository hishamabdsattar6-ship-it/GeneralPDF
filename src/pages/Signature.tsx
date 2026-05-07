import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../utils/translations';
import FileUpload from '../components/common/FileUpload';
import SignaturePad from 'signature_pad';
import { PenTool, Download, Trash2, Save, File as FileIcon } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export default function Signature() {
  const { language, startLoading, stopLoading } = useAppStore();
  const t = translations[language];
  
  const [file, setFile] = useState<File | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [result, setResult] = useState<ArrayBuffer | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [posX, setPosX] = useState<number>(50);
  const [posY, setPosY] = useState<number>(50);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (canvasRef.current && !signaturePadRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        penColor: "rgb(0, 0, 0)",
        backgroundColor: "rgba(255, 255, 255, 0)" // transparent
      });
    }
    
    // Handle resize to make it responsive
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ratio =  Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        signaturePadRef.current?.clear(); // clear on resize
      }
    };
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setSignatureData(null);
  };

  const handeSaveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setSignatureData(signaturePadRef.current.toDataURL("image/png"));
    }
  };

  const handleSignPDF = async () => {
    if (!file || !signatureData) return;
    
    startLoading(language === 'ar' ? 'جاري توقيع الملف...' : 'Signing file...');
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes.slice(0));
      
      const sigImgBytes = await fetch(signatureData).then(res => res.arrayBuffer());
      const sigImg = await pdfDoc.embedPng(sigImgBytes.slice(0));
      
      const pages = pdfDoc.getPages();
      const targetPageIndex = Math.max(0, Math.min(pages.length - 1, pageNumber - 1));
      const targetPage = pages[targetPageIndex];
      const { height } = targetPage.getSize();
      
      const sigDims = sigImg.scale(0.5);
      
      targetPage.drawImage(sigImg, {
        x: posX,
        y: height - posY - sigDims.height, // PDF coordinates are bottom-left, so we invert Y to make it top-left for user
        width: sigDims.width,
        height: sigDims.height,
      });

      const savedPdf = await pdfDoc.save();
      setResult(savedPdf.buffer);
    } catch (e: any) {
      alert(language === 'ar' ? 'فشل إدراج التوقيع: ' + e.message : 'Signature injection failed: ' + e.message);
    } finally {
      stopLoading();
    }
  };

  const handleDownloadSigImage = () => {
    if (signatureData) {
      saveAs(signatureData, 'my_signature.png');
    }
  };

  const handleDownloadPDF = () => {
    if (result) {
      const blob = new Blob([result], { type: 'application/pdf' });
      saveAs(blob, 'signed_document.pdf');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-8">
      <div className="text-center mb-4 md:mb-8">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PenTool className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--primary-blue)] mb-2">{t.signature}</h1>
        <p className="text-sm md:text-base text-[var(--text-muted)]">{language === 'ar' ? 'ارسم توقيعك وأضفه لملفاتك بسهولة وبشكل آمن.' : 'Draw your signature and add it to your files securely.'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Signature Pad Area */}
        <div className="bg-[var(--header-bg)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-base md:text-lg mb-4 self-start">{language === 'ar' ? 'ارسم توقيعك هنا' : 'Draw your signature here'}</h3>
          
          <div className="w-full h-[200px] md:h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/30 mb-4 relative cursor-crosshair">
            <canvas ref={canvasRef} className="w-full h-full block touch-none" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
            <button onClick={handleClear} className="w-full sm:w-auto px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs md:text-sm font-medium">
              <Trash2 className="w-4 h-4" />
              {language === 'ar' ? 'مسح التوقيع' : 'Clear'}
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button onClick={handleDownloadSigImage} disabled={!signatureData} className="w-full sm:w-auto px-4 py-2 border border-[var(--border-color)] text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs md:text-sm font-medium">
                <Download className="w-4 h-4" />
                {language === 'ar' ? 'كصورة' : 'Save as PNG'}
              </button>
              <button onClick={handeSaveSignature} className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 text-xs md:text-sm font-bold">
                <Save className="w-4 h-4" />
                {language === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* PDF Interaction Area */}
        <div className="bg-[var(--header-bg)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col">
          <h3 className="font-bold text-base md:text-lg mb-4">{language === 'ar' ? 'إضافة لملف PDF' : 'Add to PDF'}</h3>
          
          {!file && (
            <div className="flex-1">
              <FileUpload onFileSelect={(files) => setFile(files[0])} accept="application/pdf" />
            </div>
          )}

          {file && !result && (
            <div className="flex-1 flex flex-col gap-4 md:gap-6">
               <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-500 shrink-0" />
                  <span className="truncate font-medium text-xs md:text-sm">{file.name}</span>
                </div>
              </div>

              {signatureData ? (
                <div className="p-4 md:p-6 border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/10 rounded-xl text-center">
                  <img src={signatureData} alt="Signature Preview" className="h-16 md:h-20 mx-auto mb-4 drop-shadow-md" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 text-left">
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1 font-bold">{language === 'ar' ? 'رقم الصفحة' : 'Page Number'}</label>
                      <input type="number" min="1" value={pageNumber} onChange={e => setPageNumber(parseInt(e.target.value) || 1)} className="w-full px-3 py-1.5 md:py-2 border border-[var(--border-color)] rounded-lg bg-white dark:bg-slate-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1 font-bold">{language === 'ar' ? 'الموقع الأفقي (X)' : 'Position X'}</label>
                      <input type="number" value={posX} onChange={e => setPosX(parseInt(e.target.value) || 0)} className="w-full px-3 py-1.5 md:py-2 border border-[var(--border-color)] rounded-lg bg-white dark:bg-slate-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1 font-bold">{language === 'ar' ? 'الموقع الرأسي (Y)' : 'Position Y'}</label>
                      <input type="number" value={posY} onChange={e => setPosY(parseInt(e.target.value) || 0)} className="w-full px-3 py-1.5 md:py-2 border border-[var(--border-color)] rounded-lg bg-white dark:bg-slate-800 text-sm" />
                    </div>
                  </div>
                  <button onClick={handleSignPDF} className="w-full py-2.5 md:py-3 bg-[var(--primary-blue)] text-white font-bold rounded-xl hover:bg-[var(--primary-blue-hover)] transition-all shadow-md mt-2 md:mt-4 text-xs md:text-sm">
                    {language === 'ar' ? 'تطبيق التوقيع' : 'Apply Signature'}
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 border-2 border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-muted)] text-center text-sm">
                  {language === 'ar' ? 'يرجى رسم التوقيع وحفظه أولاً لتتمكن من إضافته للملف.' : 'Please draw and save your signature first to add it to the file.'}
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-xl text-center space-y-4">
              <Download className="w-10 h-10 md:w-12 md:h-12 text-green-500" />
              <h4 className="font-bold text-base md:text-lg">{language === 'ar' ? 'تم توقيع الملف بنجاح!' : 'File signed successfully!'}</h4>
               <button onClick={handleDownloadPDF} className="px-6 md:px-8 py-2.5 md:py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md text-sm">
                {language === 'ar' ? 'تحميل الملف المُوقع' : 'Download Signed File'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
