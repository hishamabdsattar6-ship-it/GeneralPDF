import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import { Hash, Download, FileUp } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

type Position = 'bottom' | 'top' | 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export default function NumberPdf() {
  const { language, startLoading, stopLoading } = useAppStore();
  const t = translations[language];
  const [file, setFile] = useState<File | null>(null);
  const [startFrom, setStartFrom] = useState(1);
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState<Position>('bottom');
  const [fontSize, setFontSize] = useState(12);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    startLoading(language === 'ar' ? 'جاري ترقيم الصفحات...' : 'Numbering pages...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer.slice(0));
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let currentNum = startFrom;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const text = `${currentNum}`;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        
        let x = width / 2 - textWidth / 2;
        let y = 30;

        switch (position) {
          case 'bottom':
            x = width / 2 - textWidth / 2;
            y = 30;
            break;
          case 'top':
            x = width / 2 - textWidth / 2;
            y = height - 40;
            break;
          case 'left':
            x = 30;
            y = height / 2;
            break;
          case 'right':
            x = width - 40;
            y = height / 2;
            break;
          case 'bottom-left':
            x = 30;
            y = 30;
            break;
          case 'bottom-right':
            x = width - 40;
            y = 30;
            break;
          case 'top-left':
            x = 30;
            y = height - 40;
            break;
          case 'top-right':
            x = width - 40;
            y = height - 40;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });

        currentNum += step;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `numbered_${file.name}`);
      toast.success(language === 'ar' ? 'تم الترقيم بنجاح' : 'Numbered successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Hash className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--primary-blue)] mb-2">{t.numberPdf}</h1>
        <p className="text-[var(--text-muted)]">{t.numberPdfDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--header-bg)] p-8 rounded-2xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center space-y-4">
          <input type="file" accept=".pdf" onChange={handleFileChange} id="fileInput" className="hidden" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
            <FileUp className="w-12 h-12 text-blue-500 mb-2" />
            <span className="font-bold text-lg">{file ? file.name : (language === 'ar' ? 'اختر ملف PDF' : 'Choose PDF File')}</span>
          </label>
        </div>

        <div className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium mb-2">{t.from}</label>
               <input 
                 type="number" 
                 value={startFrom} 
                 onChange={(e) => setStartFrom(parseInt(e.target.value) || 1)}
                 className="w-full p-2 border border-[var(--border-color)] rounded-lg bg-transparent"
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-2">{t.step}</label>
               <input 
                 type="number" 
                 value={step} 
                 onChange={(e) => setStep(parseInt(e.target.value) || 1)}
                 className="w-full p-2 border border-[var(--border-color)] rounded-lg bg-transparent"
               />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.position}</label>
            <select 
              value={position} 
              onChange={(e) => setPosition(e.target.value as any)}
              className="w-full p-2 border border-[var(--border-color)] rounded-lg bg-transparent"
            >
              <option value="bottom">{t.bottom}</option>
              <option value="top">{t.top}</option>
              <option value="left">{t.left}</option>
              <option value="right">{t.right}</option>
              <option value="bottom-left">{language === 'ar' ? 'أسفل يسار' : 'Bottom Left'}</option>
              <option value="bottom-right">{language === 'ar' ? 'أسفل يمين' : 'Bottom Right'}</option>
              <option value="top-left">{language === 'ar' ? 'أعلى يسار' : 'Top Left'}</option>
              <option value="top-right">{language === 'ar' ? 'أعلى يمين' : 'Top Right'}</option>
            </select>
          </div>

          <button 
            onClick={handleProcess}
            disabled={!file}
            className="w-full py-4 bg-[var(--primary-blue)] text-white font-bold rounded-xl hover:bg-[var(--primary-blue-hover)] transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {language === 'ar' ? 'تطبيق الترقيم وتنزيل' : 'Apply & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
