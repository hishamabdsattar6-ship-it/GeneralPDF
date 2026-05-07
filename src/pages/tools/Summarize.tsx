import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { Brain, FileText, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { detectAndProcessPdf } from '../../utils/pdfProcessor';

export default function Summarize() {
  const { language, startLoading, stopLoading, isOcrProcessing } = useAppStore();
  const t = translations[language];
  const [summary, setSummary] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setLastFile(file);

    startLoading(language === 'ar' ? 'جاري تحليل وتلخيص الملف...' : 'Analyzing and summarizing file...');
    
    try {
      const pageContents = await detectAndProcessPdf(file);
      const text = pageContents.map(p => p.text).join('\n');
      
      const prompt = language === 'ar' 
        ? "لخص هذا النص بشكل احترافي مع ذكر أهم النقاط الرئيسية في نقاط محددة." 
        : "Summarize this text professionally, highlighting the key points in bullet points.";
      
      const response = await aiService.generateResponse(prompt, text);
      setSummary(response);
    } catch (error) {
      console.error('Summarize Error:', error);
      alert(language === 'ar' ? 'فشل التلخيص' : 'Failed to summarize');
    } finally {
      stopLoading();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 mb-2">
          <Brain className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {language === 'ar' ? 'تلخيص بالذكاء الاصطناعي' : 'AI Summarizer'}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'احصل على ملخص شامل واحترافي لأي ملف PDF في ثوانٍ معدودة.' 
            : 'Get a comprehensive and professional summary of any PDF file in seconds.'}
        </p>
      </div>

      {!summary ? (
        <FileUpload 
          onFileSelect={handleFileUpload} 
          accept=".pdf,image/*"
          icon={<Brain className="w-10 h-10" />}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-bottom border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {language === 'ar' ? 'الملخص الذكي' : 'AI Summary'}
              </span>
              {isOcrProcessing && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full animate-pulse ml-2">
                  OCR...
                </span>
              )}
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
                onClick={() => handleFileUpload([lastFile!])}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-blue-500 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSummary('')}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-red-500 text-sm"
              >
                {language === 'ar' ? 'مسح' : 'Clear'}
              </button>
            </div>
          </div>
          <div className="p-8 prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300" dir="auto">
              {summary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
