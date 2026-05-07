import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { usePdfWorker } from '../../hooks/usePdfWorker';
import { Layers, File as FileIcon, X, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function MergePdfPage() {
  const { language } = useAppStore();
  const t = translations[language];
  const { mergeFiles } = usePdfWorker();
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ArrayBuffer | null>(null);

  const handleFiles = (newFiles: File[]) => {
    // Append but avoid duplicates by name
    setFiles(prev => {
      const merged = [...prev];
      newFiles.forEach(nf => {
        if (!merged.find(f => f.name === nf.name)) {
          merged.push(nf);
        }
      });
      return merged;
    });
    setResult(null);
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setResult(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    try {
      const mergedBuffer = await mergeFiles(files);
      setResult(mergedBuffer);
    } catch (e: any) {
      alert(language === 'ar' ? 'فشل الدمج: ' + e.message : 'Merge failed: ' + e.message);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'application/pdf' });
    saveAs(blob, 'merged.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-[var(--primary-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--primary-blue)] mb-2">{t.mergePdf}</h1>
        <p className="text-[var(--text-muted)]">{t.mergePdfDesc}</p>
      </div>

      {!result && (
        <>
          <div className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <FileUpload onFileSelect={handleFiles} multiple accept="application/pdf" />
          </div>

          {files.length > 0 && (
            <div className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
              <h3 className="font-bold text-lg mb-4">{language === 'ar' ? 'الملفات المحددة:' : 'Selected Files:'}</h3>
              <div className="grid gap-3">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileIcon className="w-6 h-6 text-blue-500 shrink-0" />
                      <span className="truncate font-medium text-sm">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(idx)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleMerge}
                  disabled={files.length < 2}
                  className="px-6 py-3 bg-[var(--primary-blue)] text-white font-bold rounded-xl hover:bg-[var(--primary-blue-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {language === 'ar' ? 'دمج الملفات' : 'Merge Files'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {result && (
        <div className="bg-[var(--header-bg)] p-10 rounded-2xl border border-green-200 dark:border-green-800 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4">{language === 'ar' ? 'تم دمج الملفات بنجاح!' : 'Files merged successfully!'}</h2>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleDownload}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md"
            >
              {language === 'ar' ? 'تحميل الملف' : 'Download File'}
            </button>
            <button 
              onClick={() => { setFiles([]); setResult(null); }}
              className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              {language === 'ar' ? 'دمج المزيد' : 'Merge More'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
