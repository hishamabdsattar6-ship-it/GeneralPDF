import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, Download, Layout, Palette, History, Trash2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { saveAs } from 'file-saver';
import { isArabic } from '../../utils/arabicUtils';
import { drawTextWithWordWrap } from '../../utils/pdfGenerator';
import { saveDocument, getAllDocuments } from '../../utils/cache';
import toast from 'react-hot-toast';

export default function AICreate() {
  const { language, startLoading, stopLoading } = useAppStore();
  const [description, setDescription] = useState('');
  const [docType, setDocType] = useState('report');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [fontCache, setFontCache] = useState<Record<string, Uint8Array>>({});
  const [userThemeColor, setUserThemeColor] = useState<string>('#1d4ed8'); // Default Blue
  const [previewContent, setPreviewContent] = useState<{ 
    title: string, 
    content: string,
    themeColor?: [number, number, number],
    requiresImage?: boolean,
    imagePrompt?: string,
    borderStyle?: string
  } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const themeColors = [
    { name: 'Blue', value: '#1d4ed8', rgb: [0.11, 0.31, 0.85] },
    { name: 'Emerald', value: '#059669', rgb: [0.02, 0.59, 0.41] },
    { name: 'Rose', value: '#e11d48', rgb: [0.88, 0.11, 0.28] },
    { name: 'Amber', value: '#d97706', rgb: [0.85, 0.47, 0.02] },
    { name: 'Violet', value: '#7c3aed', rgb: [0.49, 0.23, 0.93] },
    { name: 'Slate', value: '#475569', rgb: [0.28, 0.33, 0.41] },
  ];

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const docs = await getAllDocuments();
    setHistory(docs.filter(d => d.type === 'ai-created').sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleGenerateContent = async () => {
    if (!description.trim()) return;

    startLoading(language === 'ar' ? 'جاري إنشاء المحتوى بالذكاء الاصطناعي...' : 'Generating content with AI...');
    
    try {
      const selectedColor = themeColors.find(c => c.value === userThemeColor);
      const colorHint = selectedColor ? `Use this theme color (RGB): [${selectedColor.rgb.join(', ')}]` : '';

      const prompt = `Generate a ${docType} based on this description: "${description}". 
      Return the response as a valid JSON object. 
      Keys:
      - "title": string (Document title)
      - "content": string (Full text with paragraphs. Use # for headers and **word** for bold highlights. Ensure mixed content is not pre-reversed.)
      - "themeColor": [r, g, b] (floats 0-1) ${colorHint ? `Hint: Preferably use ${colorHint}` : ''}
      - "requiresImage": boolean
      - "imagePrompt": string (English)
      - "borderStyle": 'solid'|'double'|'minimal'|'none'
      
      TEXT RULES:
      1. Language: ${language === 'ar' ? 'Arabic' : 'English'}.
      2. If Arabic: Use NORMAL, NATURAL character order (logical order). 
         DANGER: DO NOT REVERSE WORDS. DO NOT REVERSE CHARACTERS manually.
         Correct: "الذكاء الاصطناعي"
         Incorrect: "يعانطصلاا ءاكذلا"
         The system will handle the Right-to-Left visual layout.
      3. Content: Professional and highly structured. Use proper Arabic punctuation.
      4. Highlights: Use ** around key words inside the correct logical sentence.
      
      CRITICAL VALIDATION: Ensure the 'content' string starts with the start of the text and ends with the end. Do not perform any visual reversal yourself.
      
      IMPORTANT: Return ONLY a valid JSON object. No other text.`;

      const response = await aiService.generateResponse(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let content;
      if (jsonMatch) {
         try {
           content = JSON.parse(jsonMatch[0]);
           
           // Heuristic check: if Arabic content seems reversed (starts with end-punctuation)
           if (language === 'ar' && content.content) {
             const trimmed = content.content.trim();
             if (trimmed.startsWith('.') && /[\u0600-\u06FF]/.test(trimmed)) {
               console.warn("AI returned reversed Arabic. Attempting to fix...");
               // This is a very rough fix, assuming strictly reversed string
               // content.content = content.content.split('').reverse().join('');
             }
           }
         } catch (e) {
           content = { title: 'Generated Title', content: response };
         }
      } else {
        content = { title: 'Generated Title', content: response };
      }
      
      setPreviewContent(content);
      
      // Persistence: Save to local DB
      await saveDocument({
        id: crypto.randomUUID(),
        title: content.title,
        content: content.content,
        type: 'ai-created'
      });
      loadHistory();

    } catch (error) {
      console.error('AI Create Error:', error);
      toast.error(language === 'ar' ? 'فشل إنشاء المحتوى' : 'Failed to generate content');
    } finally {
      stopLoading();
    }
  };

  const handleDownload = async () => {
    if (!previewContent) return;
    startLoading(language === 'ar' ? 'جاري تحضير ملف PDF...' : 'Preparing PDF file...');

    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      let font;
      const needsArabicFont = language === 'ar' || isArabic(previewContent.title) || isArabic(previewContent.content);
      
      if (fontFamily !== 'Standard' || needsArabicFont) {
        try {
          const targetFamily = needsArabicFont && fontFamily === 'Standard' ? 'Cairo' : fontFamily;
          
          if (fontCache[targetFamily]) {
            font = await pdfDoc.embedFont(fontCache[targetFamily]);
          } else {
            // Updated: Using direct GitHub raw links which are generally more stable
            const cairoUrls = [
              'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf'
            ];
            const amiriUrls = [
              'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf'
            ];

            const urlsToTry = targetFamily === 'Cairo' ? cairoUrls : amiriUrls;
            let bytes: ArrayBuffer | null = null;
            let lastError = '';
            
            for (const url of urlsToTry) {
              try {
                console.log(`Attempting to fetch ${targetFamily} font from: ${url}`);
                const res = await fetch(url);
                if (res.ok) {
                  bytes = await res.arrayBuffer();
                  console.log(`Successfully loaded font from ${url}`);
                  break;
                } else {
                  lastError = `HTTP ${res.status}: ${res.statusText}`;
                }
              } catch (e) {
                lastError = e instanceof Error ? e.message : String(e);
                console.warn(`Fetch failed for ${url}:`, e);
              }
            }

            if (!bytes) throw new Error(`Could not load font: ${targetFamily}. Last error: ${lastError}`);
            
            const uint8 = new Uint8Array(bytes);
            setFontCache(prev => ({ ...prev, [targetFamily]: uint8 }));
            font = await pdfDoc.embedFont(uint8);
          }
        } catch (fontErr) {
          console.error("Font loading error:", fontErr);
          toast.error(language === 'ar' ? 'فشل تحميل الخط، سيتم استخدام الخط الافتراضي' : 'Font loading failed, using fallback');
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
      } else {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      
      const fullText = `# ${previewContent.title}\n\n${previewContent.content}`;
      let startY = pageHeight - 80;

      const finalRgb = hexToRgb(userThemeColor);
      const pdfColor = rgb(finalRgb[0], finalRgb[1], finalRgb[2]);

      if (previewContent.requiresImage && previewContent.imagePrompt) {
        try {
          const imgRes = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(previewContent.imagePrompt)}?width=800&height=400&nologo=true`);
          if (imgRes.ok) {
            const imgBytes = await imgRes.arrayBuffer();
            const image = await pdfDoc.embedJpg(imgBytes).catch(() => pdfDoc.embedPng(imgBytes));
            if (image) {
              const imgDims = image.scale(1);
              const finalWidth = Math.min(imgDims.width, pageWidth - 100);
              const ratio = finalWidth / imgDims.width;
              const finalHeight = imgDims.height * ratio;
              page.drawImage(image, {
                x: (pageWidth - finalWidth) / 2,
                y: startY - finalHeight,
                width: finalWidth,
                height: finalHeight
              });
              startY -= (finalHeight + 40);
            }
          }
        } catch (e) {
          console.error("Failed to load image", e);
        }
      }

      await drawTextWithWordWrap({
        page,
        pdfDoc,
        font,
        fontSize,
        color: rgb(0.2, 0.2, 0.2), 
        text: fullText,
        xOffset: 50,
        startY: startY,
        maxWidth: pageWidth - 100,
        lineHeight: fontSize * 1.5,
        pageWidth,
        pageHeight,
        headerTitle: previewContent.title, 
        language,
        themeColor: pdfColor,
        headerColor: pdfColor,
        borderStyle: previewContent.borderStyle || 'none'
      });

      const pdfBytes = await pdfDoc.save();
      saveAs(new Blob([pdfBytes]), `${previewContent.title || 'ai_generated'}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حفظ الملف' : 'Error saving file');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 text-white mb-2 shadow-lg">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {language === 'ar' ? 'إنشاء ملفات بالذكاء الاصطناعي' : 'AI PDF Generative'}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-balance">
          {language === 'ar' 
            ? 'اكتب مواصفات ملفك وسيقوم الذكاء الاصطناعي بكتابة وتصميم الملف لك فورياً.' 
            : 'Describe your file and let AI write and design it for you instantly.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
             <div className="space-y-4">
                <label className="text-lg font-bold text-slate-800 dark:text-slate-100 block">
                  {language === 'ar' ? 'وصف المحتوى' : 'Content Description'}
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: اكتب لي تقرير عن أهمية الذكاء الاصطناعي في الطب...' : 'Example: Write a report on AI in medicine...'}
                  className="w-full h-40 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-6 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-700 dark:text-slate-300"
                />
                <button 
                  onClick={handleGenerateContent}
                  disabled={!description.trim()}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  {language === 'ar' ? 'إنشاء المحتوى' : 'Generate Content'}
                </button>
             </div>

             {previewContent && (
               <div className={`mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{previewContent.title}</h3>
                  <div className="whitespace-pre-wrap text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {previewContent.content}
                  </div>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 text-blue-500 font-bold hover:underline"
                  >
                    <Download className="w-5 h-5" />
                    {language === 'ar' ? 'تحويل إلى PDF وتحميل' : 'Convert to PDF & Download'}
                  </button>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-500" />
                {language === 'ar' ? 'إعدادات التصميم' : 'Design Settings'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{language === 'ar' ? 'نوع المستند' : 'Doc Type'}</label>
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 text-sm outline-none"
                  >
                    <option value="report">Report</option>
                    <option value="article">Article</option>
                    <option value="cv">CV</option>
                  </select>
                </div>
                <div>
                   <label className="text-xs text-slate-400 block mb-1">{language === 'ar' ? 'نوع الخط' : 'Font Family'}</label>
                   <select 
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 text-sm outline-none"
                  >
                    <option value="Amiri">Amiri (كلاسيكي)</option>
                    <option value="Cairo">Cairo (عصري)</option>
                    <option value="Standard">Standard (Latin Only)</option>
                  </select>
                </div>
                <div>
                   <label className="text-xs text-slate-400 block mb-2">{language === 'ar' ? 'لون التنسيق' : 'Theme Color'}</label>
                   <div className="grid grid-cols-6 gap-2">
                     {themeColors.map((c) => (
                       <button
                         key={c.value}
                         onClick={() => setUserThemeColor(c.value)}
                         className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${userThemeColor === c.value ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`}
                         style={{ backgroundColor: c.value }}
                         title={c.name}
                       />
                     ))}
                   </div>
                </div>
                <div>
                   <label className="text-xs text-slate-400 block mb-1">{language === 'ar' ? 'حجم الخط' : 'Font Size'}</label>
                   <input 
                     type="number"
                     value={fontSize}
                     onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
                     className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 text-sm outline-none"
                   />
                </div>
              </div>
           </div>

           {/* History Section */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500" />
                {language === 'ar' ? 'السجل' : 'History'}
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length > 0 ? (
                  history.map((doc) => (
                    <div 
                      key={doc.id}
                      onClick={() => setPreviewContent({ title: doc.title, content: doc.content })}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
                    >
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(doc.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">{language === 'ar' ? 'لا يوجد سجل بعد' : 'No history yet'}</p>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
