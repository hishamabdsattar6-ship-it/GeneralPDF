import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { Scan, Download, Copy, FileText, Check } from 'lucide-react';
import { detectAndProcessPdf } from '../../utils/pdfProcessor';

export default function OCR() {
  const { language, startLoading, stopLoading } = useAppStore();
  const t = translations[language];
  const [extractedText, setExtractedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    startLoading(language === 'ar' ? 'جاري استخراج النص...' : 'Extracting text...');
    
    try {
      const contents = await detectAndProcessPdf(file);
      const fullText = contents.map((c, i) => `\n--- Page ${i + 1} ---\n${c.text}\n`).join('');
      setExtractedText(fullText);
    } catch (error) {
      console.error('OCR Error:', error);
      alert(language === 'ar' ? 'فشل استخراج النص' : 'Failed to extract text');
    } finally {
      stopLoading();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mb-2">
          <Scan className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {language === 'ar' ? 'استخراج النصوص (OCR)' : 'Text Recognition (OCR)'}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'حول الصور والملفات الممسوحة ضوئياً إلى نصوص قابلة للتحرير بدعم كامل للعربية والإنجليزية.' 
            : 'Convert images and scanned PDFs into editable text with full support for Arabic and English.'}
        </p>
      </div>

      {!extractedText ? (
        <FileUpload 
          onFileSelect={handleFileUpload} 
          accept=".pdf,image/*"
          icon={<Scan className="w-10 h-10" />}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-bottom border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {language === 'ar' ? 'النص المستخرج' : 'Extracted Text'}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm">{language === 'ar' ? 'نسخ' : 'Copy'}</span>
              </button>
              <button 
                onClick={() => setExtractedText('')}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-red-500 text-sm"
              >
                {language === 'ar' ? 'مسح' : 'Clear'}
              </button>
            </div>
          </div>
          <div className="p-8">
            <textarea 
              value={extractedText}
              readOnly
              dir="auto"
              className="w-full h-[500px] bg-transparent border-none focus:ring-0 resize-none font-sans leading-relaxed text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
