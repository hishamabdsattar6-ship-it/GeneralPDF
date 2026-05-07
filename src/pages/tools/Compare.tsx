import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { Files, AlertCircle, FileText } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { detectAndProcessPdf } from '../../utils/pdfProcessor';

export default function Compare() {
  const { language, startLoading, stopLoading, isOcrProcessing } = useAppStore();
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [comparisonResult, setComparisonResult] = useState('');

  const handleCompare = async () => {
    if (!file1 || !file2) return;

    startLoading(language === 'ar' ? 'جاري تحليل ومقارنة الملفات...' : 'Analyzing and comparing files...');
    
    try {
      const contents1 = await detectAndProcessPdf(file1);
      const contents2 = await detectAndProcessPdf(file2);
      
      const text1 = contents1.map(c => c.text).join('\n');
      const text2 = contents2.map(c => c.text).join('\n');
      
      const prompt = language === 'ar'
        ? "قارن بين هذين النصين واستخلص أوجه التشابه والاختلاف الرئيسية بينهما في نقاط واضحة ومحددة. ركز على التغييرات الجوهرية."
        : "Compare these two texts and highlight the main similarities and differences between them in clear point-by-point sections. Focus on substantive changes.";
      
      const combinedContext = `File 1: ${text1}\n\n---\n\nFile 2: ${text2}`;
      const response = await aiService.generateResponse(prompt, combinedContext);
      setComparisonResult(response);
    } catch (error) {
      console.error('Compare Error:', error);
      alert(language === 'ar' ? 'فشل مقارنة الملفات' : 'Failed to compare files');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 mb-2">
          <Files className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {language === 'ar' ? 'مقارنة الملفات' : 'Compare PDFs'}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'ارفع ملفين ودع الذكاء الاصطناعي يحلل الفروقات الدقيقة بينهما.' 
            : 'Upload two files and let AI analyze the subtle differences between them.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <div className="space-y-4">
          <h3 className="font-bold text-center text-slate-700 dark:text-slate-200">
            {language === 'ar' ? 'الملف الأول' : 'First File'}
          </h3>
          {file1 ? (
             <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center">
                <FileText className="w-12 h-12 text-slate-400 mb-4" />
                <span className="font-bold truncate w-full px-4">{file1.name}</span>
                <button onClick={() => setFile1(null)} className="text-xs text-red-500 mt-4 hover:underline">
                  {language === 'ar' ? 'تغيير' : 'Change'}
                </button>
             </div>
          ) : (
             <FileUpload onFileSelect={(f) => setFile1(f[0])} accept=".pdf,image/*" />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-center text-slate-700 dark:text-slate-200">
            {language === 'ar' ? 'الملف الثاني' : 'Second File'}
          </h3>
          {file2 ? (
             <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center">
                <FileText className="w-12 h-12 text-slate-400 mb-4" />
                <span className="font-bold truncate w-full px-4">{file2.name}</span>
                <button onClick={() => setFile2(null)} className="text-xs text-red-500 mt-4 hover:underline">
                  {language === 'ar' ? 'تغيير' : 'Change'}
                </button>
             </div>
          ) : (
            <FileUpload onFileSelect={(f) => setFile2(f[0])} accept=".pdf,image/*" />
          )}
        </div>
      </div>

      <div className="flex justify-center">
         <button 
           disabled={!file1 || !file2}
           onClick={handleCompare}
           className="h-14 px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
         >
           {language === 'ar' ? 'بدء المقارنة' : 'Start Comparison'}
         </button>
      </div>

      {comparisonResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
             <AlertCircle className="w-6 h-6 text-amber-500" />
             {language === 'ar' ? 'تقرير المقارنة الذكي' : 'Smart Comparison Report'}
           </h2>
           <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300" dir="auto">
             {comparisonResult}
           </div>
        </div>
      )}
    </div>
  );
}
