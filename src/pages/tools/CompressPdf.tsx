import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { usePdfWorker } from '../../hooks/usePdfWorker';
import { Minimize, File as FileIcon, X, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function CompressPdfPage() {
  const { language } = useAppStore();
  const t = translations[language];
  const { compressPdf } = usePdfWorker();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ArrayBuffer | null>(null);
  const [stats, setStats] = useState<{before: number, after: number} | null>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setStats(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    try {
      const compressedBuffer = await compressPdf(file);
      setResult(compressedBuffer);
      setStats({
        before: file.size,
        after: compressedBuffer.byteLength
      });
    } catch (e: any) {
      alert(language === 'ar' ? 'فشل الضغط: ' + e.message : 'Compression failed: ' + e.message);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'application/pdf' });
    saveAs(blob, 'compressed.pdf');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Minimize className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--primary-blue)] mb-2">{t.compressPdf}</h1>
        <p className="text-[var(--text-muted)]">{t.compressPdfDesc}</p>
      </div>

      {!result && !file && (
        <div className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <FileUpload onFileSelect={handleFile} accept="application/pdf" />
        </div>
      )}

      {file && !result && (
        <div className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileIcon className="w-6 h-6 text-green-500 shrink-0" />
              <div className="flex flex-col">
                <span className="truncate font-medium text-sm">{file.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{formatBytes(file.size)}</span>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-[var(--text-muted)] bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
            {language === 'ar' 
              ? 'ملاحظة: خوارزمية الضغط في المتصفح قد لا تقلل المساحة بشكل كبير للملفات المليئة بالصور عالية الدقة مقارنة بالأدوات السحابية.' 
              : 'Note: In-browser compression algorithm might not reduce the size significantly for files full of high-res images compared to cloud tools.'}
          </p>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleCompress}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md"
            >
              {language === 'ar' ? 'ضغط الملف' : 'Compress File'}
            </button>
          </div>
        </div>
      )}

      {result && stats && (
        <div className="bg-[var(--header-bg)] p-10 rounded-2xl border border-green-200 dark:border-green-800 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-8">{language === 'ar' ? 'تم ضغط الملف بنجاح!' : 'File compressed successfully!'}</h2>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">{language === 'ar' ? 'قبل' : 'Before'}</p>
              <p className="text-xl font-bold text-slate-400 line-through">{formatBytes(stats.before)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-green-600 mb-1 uppercase tracking-wider">{language === 'ar' ? 'بعد' : 'After'}</p>
              <p className="text-2xl font-black text-green-600">{formatBytes(stats.after)}</p>
            </div>
            {stats.before > stats.after && (
              <div className="text-center">
                <p className="text-xs text-[var(--primary-blue)] mb-1 uppercase tracking-wider">{language === 'ar' ? 'تم توفير' : 'Saved'}</p>
                <p className="text-2xl font-bold text-[var(--primary-blue)]">
                  {Math.round(((stats.before - stats.after) / stats.before) * 100)}%
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button 
              onClick={handleDownload}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md"
            >
              {language === 'ar' ? 'تحميل الملف' : 'Download File'}
            </button>
            <button 
              onClick={() => { setFile(null); setResult(null); setStats(null); }}
              className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              {language === 'ar' ? 'ضغط ملف آخر' : 'Compress Another'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
