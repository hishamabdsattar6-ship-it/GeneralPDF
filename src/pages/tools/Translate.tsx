import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { Languages, Download, FileText, Globe } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { saveAs } from 'file-saver';
import { detectAndProcessPdf } from '../../utils/pdfProcessor';

import { reshapeArabic, isArabic } from '../../utils/arabicUtils';
import { drawTextWithWordWrap } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

export default function Translate() {
  const { language, startLoading, stopLoading, isOcrProcessing } = useAppStore();
  const [targetLang, setTargetLang] = useState('English');
  const [file, setFile] = useState<File | null>(null);

  const handleTranslate = async () => {
    if (!file) return;

    startLoading(language === 'ar' ? `جاري الترجمة إلى ${targetLang}...` : `Translating to ${targetLang}...`);
    
    try {
      const pageContents = await detectAndProcessPdf(file);
      const text = pageContents.map(p => p.text).join('\n');

      const prompt = `Translate this text to ${targetLang} while keeping the same tone. Return ONLY the translated text. Maintain formatting if possible.`;
      const translatedText = await aiService.generateResponse(prompt, text);

      // Create new PDF with translated text
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      
      let font;
      const isTargetArabic = targetLang === 'Arabic' || targetLang === 'العربية';
      const needsArabicFont = isTargetArabic || isArabic(translatedText) || language === 'ar';
      
      if (needsArabicFont) {
         try {
           const urls = [
             'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf',
             'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/static/Amiri-Regular.ttf'
           ];
           let bytes: ArrayBuffer | null = null;
           for (const url of urls) {
             try {
               const res = await fetch(url);
               if (res.ok) {
                 bytes = await res.arrayBuffer();
                 break;
               }
             } catch (e) {}
           }
           if (!bytes) throw new Error("Font fetch failed");
           font = await pdfDoc.embedFont(new Uint8Array(bytes));
         } catch (err) {
           console.error("Font error, using Helvetica fallback:", err);
           font = await pdfDoc.embedFont(StandardFonts.Helvetica);
         }
      } else {
         font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      
      await drawTextWithWordWrap({
        page,
        pdfDoc,
        font,
        fontSize: 14,
        color: rgb(0.2, 0.2, 0.2),
        text: translatedText,
        xOffset: 50,
        startY: pageHeight - 80,
        maxWidth: pageWidth - 100,
        lineHeight: 21,
        pageWidth,
        pageHeight,
        headerTitle: language === 'ar' ? `مترجم GeneralPDF - ${targetLang}` : `GeneralPDF Translator - ${targetLang}`,
        language,
      });

      const pdfBytes = await pdfDoc.save();
      saveAs(new Blob([pdfBytes]), `translated_${file.name}`);
    } catch (error) {
      console.error('Translation Error:', error);
      toast.error(language === 'ar' ? 'فشل ترجمة الملف' : 'Failed to translate file');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-500 mb-2">
          <Languages className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {language === 'ar' ? 'ترجمة الملفات الذكية' : 'AI PDF Translator'}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {language === 'ar' 
            ? 'ترجم ملفات الـ PDF الخاصة بك إلى أي لغة في العالم مع الحفاظ على التنسيق وجوهر المحتوى.' 
            : 'Translate your PDFs into any language in the world while maintaining context and intent.'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col items-center gap-8">
        <div className="w-full max-w-md">
           {!file ? (
             <FileUpload onFileSelect={(f) => setFile(f[0])} accept=".pdf,image/*" />
           ) : (
             <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-teal-500" />
                  <span className="font-bold truncate">{file.name}</span>
                  {isOcrProcessing && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full animate-pulse">OCR...</span>}
                </div>
                <button onClick={() => setFile(null)} className="text-red-500 text-sm">{language === 'ar' ? 'تغيير' : 'Change'}</button>
             </div>
           )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          <div className="relative flex-1 w-full">
            <label className="text-xs text-slate-400 block mb-1 px-1">{language === 'ar' ? 'اللغة المستهدفة' : 'Target Language'}</label>
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Arabic">العربية (Arabic)</option>
              <option value="English">English</option>
              <option value="French">Français (French)</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="German">Deutsch (German)</option>
            </select>
          </div>
          <button 
            disabled={!file}
            onClick={handleTranslate}
            className="h-12 px-8 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-all shadow-md disabled:opacity-50 w-full sm:w-auto mt-5"
          >
            {language === 'ar' ? 'ترجمة الآن' : 'Translate Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
