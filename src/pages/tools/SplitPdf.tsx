import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { usePdfWorker } from '../../hooks/usePdfWorker';
import { SplitSquareHorizontal, File as FileIcon, X, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function SplitPdfPage() {
  const { language } = useAppStore();
  const t = translations[language];
  const { splitPdf } = usePdfWorker();
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState<{start: string | number, end: string | number}>([{ start: '', end: '' }]);
  const [result, setResult] = useState<ArrayBuffer | null>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
  };

  const handleSplit = async () => {
    if (!file) return;
    try {
      const validRanges = ranges.filter(r => r.start !== '' && r.end !== '').map(r => ({ start: Number(r.start), end: Number(r.end) }));
      if (validRanges.length === 0) {
        alert(language === 'ar' ? 'الرجاء إدخال نطاقات صحيحة' : 'Please enter valid ranges');
        return;
      }
      const splitBuffer = await splitPdf(file, validRanges);
      setResult(splitBuffer);
    } catch (e: any) {
      alert(language === 'ar' ? 'فشل التقسيم: ' + e.message : 'Split failed: ' + e.message);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'application/pdf' });
    saveAs(blob, 'split.pdf');
  };

  const addRange = () => setRanges([...ranges, { start: '', end: '' }]);
  const removeRange = (idx: number) => setRanges(ranges.filter((_, i) => i !== idx));
  const updateRange = (idx: number, key: 'start' | 'end', val: string) => {
    const newRanges = [...ranges];
    const numVal = parseInt(val);
    if (!isNaN(numVal)) {
      newRanges[idx][key] = Math.max(1, numVal);
      if (key === 'start' && newRanges[idx].end !== '' && newRanges[idx].start > newRanges[idx].end) {
        newRanges[idx].end = newRanges[idx].start;
      }
    } else {
      newRanges[idx][key] = '';
    }
    setRanges(newRanges);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <SplitSquareHorizontal className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--primary-blue)] mb-2">{t.splitPdf}</h1>
        <p className="text-[var(--text-muted)]">{t.splitPdfDesc}</p>
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
              <FileIcon className="w-6 h-6 text-indigo-500 shrink-0" />
              <span className="truncate font-medium text-sm">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">{language === 'ar' ? 'حدد النطاقات:' : 'Select Ranges:'}</h3>
            {ranges.map((r, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium w-8">{language === 'ar' ? 'نطاق' : 'Range'} {idx+1}</span>
                <input 
                  type="number" 
                  min={1} 
                  value={r.start} 
                  onChange={e => updateRange(idx, 'start', e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل' : 'Enter'}
                  className="w-24 px-3 py-2 border border-[var(--border-color)] rounded-lg bg-transparent"
                />
                <span className="text-[var(--text-muted)]">-</span>
                <input 
                  type="number" 
                  min={1} 
                  value={r.end} 
                  onChange={e => updateRange(idx, 'end', e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل' : 'Enter'}
                  className="w-24 px-3 py-2 border border-[var(--border-color)] rounded-lg bg-transparent"
                />
                {ranges.length > 1 && (
                  <button onClick={() => removeRange(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addRange} className="text-sm text-[var(--primary-blue)] hover:underline font-medium">
              {language === 'ar' ? '+ إضافة نطاق آخر' : '+ Add another range'}
            </button>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSplit}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
            >
              {language === 'ar' ? 'تقسيم الملف' : 'Split File'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-[var(--header-bg)] p-10 rounded-2xl border border-green-200 dark:border-green-800 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4">{language === 'ar' ? 'تم استخراج الصفحات بنجاح!' : 'Pages extracted successfully!'}</h2>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleDownload}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md"
            >
              {language === 'ar' ? 'تحميل الملف' : 'Download File'}
            </button>
            <button 
              onClick={() => { setFile(null); setResult(null); }}
              className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              {language === 'ar' ? 'تقسيم ملف آخر' : 'Split Another'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
