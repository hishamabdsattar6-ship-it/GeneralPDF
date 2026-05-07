import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import { PlusSquare, Download, AppWindow, Plus, Trash2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { processArabicText, isArabic } from '../../utils/arabicUtils';

interface PageData {
  id: string;
  title: string;
  content: string;
  bgColor: string; // hex
  textColor: string; // hex
  fontSize: number;
  fontFamily: 'Tajawal' | 'Amiri' | 'Cairo' | 'Standard';
  borderStyle: 'none' | 'formal' | 'elegant';
  image?: string; // Data URL
  imageFit?: 'contain' | 'cover' | 'stretch';
}

export default function CreatePdfPage() {
  const { language, startLoading, stopLoading } = useAppStore();
  const t = translations[language];
  const [pages, setPages] = useState<PageData[]>([{
    id: '1', title: 'عنوان المستند', content: 'نص تجريبي هنا...', bgColor: '#ffffff', textColor: '#000000', fontSize: 16, fontFamily: 'Amiri', borderStyle: 'none'
  }]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const addPage = () => {
    setPages([...pages, { id: Date.now().toString(), title: '', content: '', bgColor: '#ffffff', textColor: '#000000', fontSize: 16, fontFamily: 'Amiri', borderStyle: 'none' }]);
  };

  const handleImageUpload = (id: string, file: File) => {
     const reader = new FileReader();
     reader.onload = (e) => {
       updatePage(id, { image: e.target?.result as string });
     };
     reader.readAsDataURL(file);
  };

  const removePage = (id: string) => {
    if (pages.length > 1) {
      setPages(pages.filter(p => p.id !== id));
    }
  };

  const updatePage = (id: string, updates: Partial<PageData>) => {
    setPages(pages.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 1, b: 1 };
  };

const fontCache: Record<string, ArrayBuffer> = {};

  const generatePdfBytes = async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontUrls: Record<string, string[]> = {
      Tajawal: ['https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/static/Tajawal-Regular.ttf'],
      Amiri: ['https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/static/Amiri-Regular.ttf'],
      Cairo: ['https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/static/Cairo-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo[slnt,wght].ttf'],
    };

    const getFont = async (family: string, pageData?: PageData) => {
      const needsArabic = pageData && (isArabic(pageData.title) || isArabic(pageData.content));
      if (family === 'Standard' && !needsArabic) return await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const targetFamily = (family === 'Standard' && needsArabic) ? 'Tajawal' : family;
      
      try {
        let bytes = fontCache[targetFamily];
        if (!bytes) {
          const urls = fontUrls[targetFamily as keyof typeof fontUrls] || fontUrls['Tajawal'];
          let loadedBytes: ArrayBuffer | null = null;
          for (const url of urls) {
            try {
              const res = await fetch(url);
              if (res.ok) {
                loadedBytes = await res.arrayBuffer();
                fontCache[targetFamily] = loadedBytes;
                break;
              }
            } catch (e) {}
          }
          if (!loadedBytes) throw new Error('Font load failed');
          bytes = loadedBytes;
        }
        return await pdfDoc.embedFont(new Uint8Array(bytes.slice(0)));
      } catch (err) {
        console.warn('Fallback to standard:', err);
        return await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
    };

    for (const pageData of pages) {
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();
      const customFont = await getFont(pageData.fontFamily, pageData);
      
      const bgColor = hexToRgb(pageData.bgColor);
      page.drawRectangle({
        x: 0, y: 0, width, height,
        color: rgb(bgColor.r, bgColor.g, bgColor.b)
      });

      if (pageData.borderStyle === 'formal') {
        page.drawRectangle({
          x: 20, y: 20, width: width - 40, height: height - 40,
          borderColor: rgb(0, 0, 0),
          borderWidth: 2,
        });
      } else if (pageData.borderStyle === 'elegant') {
        page.drawRectangle({
          x: 30, y: 30, width: width - 60, height: height - 60,
          borderColor: rgb(0.5, 0.5, 0.5),
          borderWidth: 1,
          color: rgb(bgColor.r, bgColor.g, bgColor.b)
        });
        page.drawRectangle({
          x: 34, y: 34, width: width - 68, height: height - 68,
          borderColor: rgb(0.5, 0.5, 0.5),
          borderWidth: 0.5,
        });
      }

      const textColorRgb = hexToRgb(pageData.textColor);
      const pdfTextColor = rgb(textColorRgb.r, textColorRgb.g, textColorRgb.b);

      if (pageData.image) {
        try {
          const imageBytes = await fetch(pageData.image).then(res => res.arrayBuffer());
          let img;
          if (pageData.image.includes('image/png')) {
            img = await pdfDoc.embedPng(imageBytes);
          } else {
            img = await pdfDoc.embedJpg(imageBytes);
          }

          const { width: imgWidth, height: imgHeight } = img.scale(1);
          page.drawImage(img, {
            x: 50,
            y: height - 400,
            width: width - 100,
            height: 300,
          });
        } catch (e) {
          console.error("Image embedding error:", e);
        }
      }

      const wrapTextAsync = async (text: string, maxWidth: number, fontSize: number, font: any) => {
        const paragraphs = text.split('\n');
        const wrappedLines: {text: string, drawText: string, width: number}[] = [];

        for (const para of paragraphs) {
          if (!para) {
             wrappedLines.push({text: '', drawText: '', width: 0});
             continue;
          }
          const words = para.split(' ');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const drawText = isArabic(testLine) ? await processArabicText(testLine) : testLine;
            const textWidth = font.widthOfTextAtSize(drawText, fontSize);

            if (textWidth > maxWidth && currentLine) {
              const finalDrawText = isArabic(currentLine) ? await processArabicText(currentLine) : currentLine;
              wrappedLines.push({
                text: currentLine,
                drawText: finalDrawText,
                width: font.widthOfTextAtSize(finalDrawText, fontSize)
              });
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
             const finalDrawText = isArabic(currentLine) ? await processArabicText(currentLine) : currentLine;
             wrappedLines.push({
                text: currentLine,
                drawText: finalDrawText,
                width: font.widthOfTextAtSize(finalDrawText, fontSize)
             });
          }
        }
        return wrappedLines;
      };

      const reshapedTitle = pageData.title && isArabic(pageData.title) 
        ? await processArabicText(pageData.title) 
        : pageData.title;

      const currentMaxWidth = width - 100;
      const wrappedContentLines = await wrapTextAsync(pageData.content, currentMaxWidth, pageData.fontSize, customFont);

      let currentY = height - 80;

      if (reshapedTitle) {
        const titleWidth = customFont.widthOfTextAtSize(reshapedTitle, pageData.fontSize + 8);
        page.drawText(reshapedTitle, {
          x: isArabic(pageData.title) ? width - 50 - titleWidth : 50,
          y: currentY,
          size: pageData.fontSize + 8,
          font: customFont,
          color: pdfTextColor,
        });
        currentY -= (pageData.fontSize + 30);
      }

      if (wrappedContentLines && wrappedContentLines.length > 0) {
        for (const lineObj of wrappedContentLines) {
           if (!lineObj.drawText) {
             currentY -= (pageData.fontSize * 1.5);
             continue;
           }
           page.drawText(lineObj.drawText, {
             x: isArabic(lineObj.text) ? width - 50 - lineObj.width : 50,
             y: currentY,
             size: pageData.fontSize,
             font: customFont,
             color: pdfTextColor,
           });
           currentY -= (pageData.fontSize * 1.5);
        }
      }
    }

    return await pdfDoc.save();
  };

  const handleUpdatePreview = async () => {
    try {
      const pdfBytes = await generatePdfBytes();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    startLoading(language === 'ar' ? 'جاري إنشاء الملف...' : 'Creating file...');
    try {
      const pdfBytes = await generatePdfBytes();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'created_document.pdf');
    } catch (e: any) {
      alert(language === 'ar' ? 'فشل الإنشاء: ' + e.message : 'Creation failed: ' + e.message);
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 text-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PlusSquare className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--primary-blue)] mb-2">{t.createPdf}</h1>
        <p className="text-[var(--text-muted)]">{t.createPdfDesc}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {pages.map((page, index) => (
            <div key={page.id} className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm relative">
              <h3 className="font-bold mb-4">{language === 'ar' ? `الصفحة ${index + 1}` : `Page ${index + 1}`}</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{language === 'ar' ? 'لون الخلفية' : 'Background Color'}</label>
                  <input type="color" value={page.bgColor} onChange={e => updatePage(page.id, { bgColor: e.target.value })} className="w-full h-10 rounded cursor-pointer border border-[var(--border-color)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{language === 'ar' ? 'لون النص' : 'Text Color'}</label>
                  <input type="color" value={page.textColor} onChange={e => updatePage(page.id, { textColor: e.target.value })} className="w-full h-10 rounded cursor-pointer border border-[var(--border-color)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{language === 'ar' ? 'نمط الإطار' : 'Border Style'}</label>
                  <select value={page.borderStyle} onChange={e => updatePage(page.id, { borderStyle: e.target.value as any })} className="w-full h-10 border border-[var(--border-color)] rounded-lg px-2 bg-transparent text-sm">
                    <option value="none">{language === 'ar' ? 'بدون' : 'None'}</option>
                    <option value="formal">{language === 'ar' ? 'رسمي' : 'Formal'}</option>
                    <option value="elegant">{language === 'ar' ? 'أنيق' : 'Elegant'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{language === 'ar' ? 'حجم الخط' : 'Font Size'}</label>
                  <input type="number" min="8" max="72" value={page.fontSize} onChange={e => updatePage(page.id, { fontSize: parseInt(e.target.value) || 16 })} className="w-full h-10 border border-[var(--border-color)] rounded-lg px-3 bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{language === 'ar' ? 'نوع الخط' : 'Font Family'}</label>
                  <select value={page.fontFamily} onChange={e => updatePage(page.id, { fontFamily: e.target.value as any })} className="w-full h-10 border border-[var(--border-color)] rounded-lg px-2 bg-transparent text-sm">
                    <option value="Amiri">Amiri (عربي)</option>
                    <option value="Standard">Standard (English)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{language === 'ar' ? 'رفع صورة' : 'Upload Image'}</label>
                  <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(page.id, e.target.files[0])} className="w-full text-xs" />
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{language === 'ar' ? 'العنوان' : 'Title'}</label>
                  <input type="text" value={page.title} onChange={e => updatePage(page.id, { title: e.target.value })} className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-transparent text-lg font-bold" placeholder={language === 'ar' ? 'أدخل عنوان الصفحة' : 'Enter page title'} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">{language === 'ar' ? 'النص' : 'Content Text'}</label>
                  <textarea value={page.content} onChange={e => updatePage(page.id, { content: e.target.value })} className="w-full h-32 p-3 border border-[var(--border-color)] rounded-lg bg-transparent resize-y" placeholder={language === 'ar' ? 'أدخل محتوى الصفحة هنا...' : 'Enter page content here...'} />
                </div>
              </div>

              {pages.length > 1 && (
                <button onClick={() => removePage(page.id)} className="absolute top-4 ltr:right-4 rtl:left-4 text-red-500 hover:bg-red-50 p-2 rounded-full">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          <button onClick={addPage} className="w-full py-4 border-2 border-dashed border-[var(--border-color)] text-[var(--primary-blue)] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة صفحة' : 'Add Page'}
          </button>
        </div>

        <div className="lg:w-1/3 space-y-6">
          <div className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AppWindow className="w-5 h-5 text-[var(--primary-blue)]" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {language === 'ar' ? `إجمالي الصفحات: ${pages.length}` : `Total Pages: ${pages.length}`}
            </p>
            <div className="space-y-3">
              <button onClick={handleUpdatePreview} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm">
                {language === 'ar' ? 'تحديث المعاينة' : 'Update Preview'}
              </button>
              <button onClick={handleCreate} className="w-full py-3 bg-[var(--primary-blue)] text-white font-bold rounded-xl hover:bg-[var(--primary-blue-hover)] transition-all shadow-md flex justify-center items-center gap-2">
                <Download className="w-5 h-5" />
                {language === 'ar' ? 'إنشاء وتنزيل PDF' : 'Create & Download PDF'}
              </button>
            </div>
          </div>
          
          {previewUrl && (
            <div className="bg-[#525659] rounded-2xl border border-[var(--border-color)] overflow-hidden h-[500px] shadow-lg">
              <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
