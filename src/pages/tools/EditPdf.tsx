import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import FileUpload from '../../components/common/FileUpload';
import { Edit3, Type, Image as ImageIcon, Square, Circle, Trash2, ChevronLeft, ChevronRight, Download, Undo, Redo } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error worker url
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { saveAs } from 'file-saver';
import { processArabicText, isArabic } from '../../utils/arabicUtils';

// Configure the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfEdit {
  id: string;
  type: 'text' | 'image' | 'rect' | 'whiteout' | 'form_text' | 'form_checkbox' | 'form_signature' | 'strikeout';
  pageIndex: number;
  x: number;
  y: number;
  content?: string;
  width?: number;
  height?: number;
  color?: string; // hex
  file?: File; // for image
  imgUrl?: string; // for rendering image on canvas
}

export default function EditPdfPage() {
  const { language, startLoading, stopLoading } = useAppStore();
  const t = translations[language];
  
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [activeTool, setActiveTool] = useState<'none' | 'text' | 'rect' | 'image' | 'whiteout' | 'form_text' | 'form_checkbox' | 'form_signature' | 'strikeout'>('none');
  const [edits, setEdits] = useState<PdfEdit[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [currentText, setCurrentText] = useState('New Text');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentImage, setCurrentImage] = useState<{file: File, url: string} | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; initialWidth: number; initialHeight: number } | null>(null);

  const updateEdit = (id: string, updates: Partial<PdfEdit>) => {
    setEdits(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEdit = (id: string) => {
    setEdits(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleMouseDown = (edit: PdfEdit, e: React.MouseEvent) => {
    if (activeTool !== 'none') return;
    e.stopPropagation();
    setSelectedId(edit.id);
    setDragging({
      id: edit.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: edit.x,
      initialY: edit.y
    });
  };

  const handleResizeStart = (edit: PdfEdit, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing({
      id: edit.id,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: edit.width || 100,
      initialHeight: edit.height || 50
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const dx = (e.clientX - dragging.startX);
      const dy = (e.clientY - dragging.startY);
      updateEdit(dragging.id, {
        x: Math.max(0, dragging.initialX + dx),
        y: Math.max(0, dragging.initialY + dy)
      });
    } else if (resizing) {
      const dx = (e.clientX - resizing.startX);
      const dy = (e.clientY - resizing.startY);
      updateEdit(resizing.id, {
        width: Math.max(20, resizing.initialWidth + dx),
        height: Math.max(20, resizing.initialHeight + dy)
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const renderEditElement = (edit: PdfEdit) => {
    const isSelected = selectedId === edit.id;
    
    let content;
    if (edit.type === 'text') {
      content = <div style={{ color: edit.color, fontSize: '20px', fontFamily: 'Cairo, Tajawal, sans-serif', whiteSpace: 'pre-wrap' }}>{edit.content}</div>;
    } else if (edit.type === 'rect') {
      content = <div style={{ width: '100%', height: '100%', backgroundColor: edit.color, opacity: 0.5, borderRadius: '4px' }} />;
    } else if (edit.type === 'whiteout') {
      content = <div style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', border: '1px solid #eee' }} />;
    } else if (edit.type === 'image' && edit.imgUrl) {
      content = <img src={edit.imgUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    } else if (edit.type === 'strikeout') {
       content = <div style={{ width: '100%', height: '2px', backgroundColor: edit.color || '#FF0000', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} />;
    } else if (edit.type === 'form_text') {
       content = (
         <div className="w-full h-full border-2 border-dashed border-blue-400 bg-blue-50/30 flex items-center px-2 text-[10px] text-blue-600 font-bold">
           TEXT FIELD
         </div>
       );
    } else if (edit.type === 'form_checkbox') {
       content = (
         <div className="w-full h-full border-2 border-blue-400 bg-white flex items-center justify-center text-blue-600 font-bold">
           ✓
         </div>
       );
    } else if (edit.type === 'form_signature') {
       content = (
         <div className="w-full h-full border-2 border-dashed border-amber-400 bg-amber-50/30 flex items-center justify-center text-[10px] text-amber-600 font-bold italic">
           SIGNATURE FIELD
         </div>
       );
    }

    return (
      <div
        key={edit.id}
        onMouseDown={(e) => handleMouseDown(edit, e)}
        style={{
          position: 'absolute',
          left: edit.x,
          top: edit.y,
          width: edit.width,
          height: edit.height,
          border: isSelected ? '2px solid #3B82F6' : '1px dotted transparent',
          cursor: dragging?.id === edit.id ? 'grabbing' : 'grab',
          zIndex: isSelected ? 30 : 20,
          padding: '2px'
        }}
      >
        {content}
        {isSelected && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteEdit(edit.id); }}
              className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-red-600 z-40 transition-colors"
            >
              ×
            </button>
            <div 
              onMouseDown={(e) => handleResizeStart(edit, e)}
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 cursor-se-resize rounded-full shadow-md z-40 ring-2 ring-white"
            />
          </>
        )}
      </div>
    );
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const handleFile = async (files: File[]) => {
    setFile(files[0]);
    setPageNum(1);
    setEdits([]);
    startLoading(language === 'ar' ? 'جاري تحميل الملف...' : 'Loading file...');
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      // Store a copy to avoid detachment issues
      setFileData(arrayBuffer.slice(0));
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer.slice(0),
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
        disableFontFace: true
      }).promise;
      setPdfDoc(pdf);
    } catch (e: any) {
      alert('Error loading PDF: ' + e.message);
    } finally {
      stopLoading();
    }
  };

  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      
      try {
        await renderTask.promise;
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') {
            return; // ignore cancelled render exception
        }
        throw err;
      }
    } catch (e: any) {
      console.error('Error rendering page', e);
    }
  };

  useEffect(() => {
    if (pdfDoc) renderPage();
  }, [pdfDoc, pageNum, edits]);

  const changePage = (offset: number) => {
    if (pdfDoc) {
      setPageNum(prev => {
        const next = prev + offset;
        if (next >= 1 && next <= pdfDoc.numPages) return next;
        return prev;
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let width = 100;
    let height = 50;
    if (activeTool === 'whiteout') { width = 100; height = 20; }
    if (activeTool === 'form_text') { width = 150; height = 30; }
    if (activeTool === 'form_checkbox') { width = 20; height = 20; }
    if (activeTool === 'form_signature') { width = 150; height = 50; }
    if (activeTool === 'image') { width = 150; height = 150; }

    const newEdit: PdfEdit = {
      id: Date.now().toString(),
      type: activeTool,
      pageIndex: pageNum - 1,
      x,
      y,
      color: currentColor,
      content: activeTool === 'text' ? currentText : undefined,
      width,
      height,
      file: activeTool === 'image' && currentImage ? currentImage.file : undefined,
      imgUrl: activeTool === 'image' && currentImage ? currentImage.url : undefined
    };

    setEdits([...edits, newEdit]);
    setSelectedId(newEdit.id);
    // Reset tool if it's an image to prevent accidental multiple inserts
    if (activeTool === 'image' || activeTool === 'whiteout' || activeTool.startsWith('form_') || activeTool === 'strikeout') {
        setActiveTool('none'); 
        if (activeTool === 'image') setCurrentImage(null);
    } else {
        setActiveTool('none'); // reset tool after single use
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentImage({
        file,
        url: URL.createObjectURL(file)
      });
      setActiveTool('image');
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachments([...attachments, file]);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 1, b: 1 };
  };

  const [fontCache, setFontCache] = useState<Uint8Array | null>(null);
  const [fontLoadingError, setFontLoadingError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!fileData) return;
    startLoading(language === 'ar' ? 'جاري تطبيق التعديلات...' : 'Applying edits...');
    try {
      // Use a slice to avoid using a detached buffer
      const pdfLibDoc = await PDFDocument.load(fileData.slice(0));
      pdfLibDoc.registerFontkit(fontkit);

      let customFont;
      try {
        let fontBytes = fontCache;
        if (!fontBytes) {
          const fontUrls = [
            'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf',
            'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf'
          ];
          for (const url of fontUrls) {
            try {
              console.log(`EditPdf: Attempting to fetch Arabic font from: ${url}`);
              const fontRes = await fetch(url);
              if (fontRes.ok) {
                const buffer = await fontRes.arrayBuffer();
                fontBytes = new Uint8Array(buffer);
                setFontCache(fontBytes);
                console.log(`EditPdf: Successfully loaded font from ${url}`);
                break;
              }
            } catch (e) {
              console.warn(`EditPdf: Fetch failed for ${url}`, e);
            }
          }
        }
        
        if (!fontBytes) throw new Error('Failed to load any Arabic font');
        customFont = await pdfLibDoc.embedFont(fontBytes);
      } catch (err) {
        console.warn('Falling back to standard font:', err);
        setFontLoadingError(err instanceof Error ? err.message : String(err));
      }

      const pages = pdfLibDoc.getPages();
      const form = pdfLibDoc.getForm() || pdfLibDoc.getForm(); // pdfLib doesn't auto-create implicitly but this getter creates if not exist

      // Use for...of loop for async handling inside loop
      for (const edit of edits) {
        if (edit.pageIndex < pages.length) {
          const page = pages[edit.pageIndex];
          const { height } = page.getSize();
          
          // Note: pdf-lib coordinate system is bottom-left. Canvas is top-left.
          // Rough approximation here since we used scale = 1.2 for canvas
          const pdfX = edit.x / 1.2;
          const pdfY = height - (edit.y / 1.2); 

          if (edit.type === 'rect') {
             const clr = hexToRgb(edit.color || '#3B82F6');
             page.drawRectangle({
               x: pdfX,
               y: pdfY - ((edit.height || 50) / 1.2),
               width: (edit.width || 100) / 1.2,
               height: (edit.height || 50) / 1.2,
               color: rgb(clr.r, clr.g, clr.b),
               opacity: 0.5
             });
          } else if (edit.type === 'text') {
             const clr = hexToRgb(edit.color || '#000000');
             const content = edit.content || 'Text';
             
             // Split by newlines and reverse lines order since pdf-lib coordinates go up!
             // Wait, if y goes down, for each line we subtract line height.
             const textLines = content.split('\n');
             const fontSize = 20 / 1.2;
             const isParaArabic = isArabic(content);
             const lineHeight = isParaArabic ? fontSize * 1.8 : fontSize * 1.2;

             for (let i = 0; i < textLines.length; i++) {
               const lineContent = textLines[i];
               const isLineAr = isArabic(lineContent);
               const processedContent = lineContent;

               const fontSize = 20 / 1.2;
               const textWidth = customFont ? customFont.widthOfTextAtSize(processedContent, fontSize) : 0;
               
               // If Arabic, we might want to treat the click as the right-most point if it's a RTL context
               // But for now, let's just draw it at pdfX. 
               // If it looks reversed, it might be because the user expects it to start at pdfX and go left.
               // However, pdf-lib draws right.
               
               const textOpts: any = {
                 x: isLineAr ? pdfX - textWidth : pdfX,
                 y: pdfY - (i * lineHeight),
                 size: fontSize,
                 color: rgb(clr.r, clr.g, clr.b)
               };
               if (customFont) {
                 textOpts.font = customFont;
               }
               page.drawText(processedContent, textOpts);
             }
          } else if (edit.type === 'whiteout') {
             page.drawRectangle({
               x: pdfX,
               y: pdfY - ((edit.height || 20) / 1.2),
               width: (edit.width || 100) / 1.2,
               height: (edit.height || 20) / 1.2,
               color: rgb(1, 1, 1),
             });
          } else if (edit.type === 'strikeout') {
             const clr = hexToRgb(edit.color || '#FF0000');
             page.drawLine({
               start: { x: pdfX, y: pdfY },
               end: { x: pdfX + ((edit.width || 100) / 1.2), y: pdfY },
               thickness: 2,
               color: rgb(clr.r, clr.g, clr.b)
             });
          } else if (edit.type === 'form_text') {
             const textField = form.createTextField(`field_${Math.random()}`);
             textField.addToPage(page, {
               x: pdfX,
               y: pdfY - ((edit.height || 30) / 1.2),
               width: (edit.width || 150) / 1.2,
               height: (edit.height || 30) / 1.2,
             });
          } else if (edit.type === 'form_checkbox') {
             const checkBox = form.createCheckBox(`check_${Math.random()}`);
             checkBox.addToPage(page, {
               x: pdfX,
               y: pdfY - ((edit.height || 20) / 1.2),
               width: (edit.width || 20) / 1.2,
               height: (edit.height || 20) / 1.2,
             });
          } else if (edit.type === 'form_signature') {
             try {
                // Not all pdf-lib versions have createSignature, fallback to text if missing
                const f = form as any;
                if (typeof f.createSignature === 'function') {
                    const sigField = f.createSignature(`sig_${Math.random()}`);
                    sigField.addToPage(page, {
                      x: pdfX,
                      y: pdfY - ((edit.height || 50) / 1.2),
                      width: (edit.width || 150) / 1.2,
                      height: (edit.height || 50) / 1.2,
                    });
                } else {
                    const textField = form.createTextField(`sig_fallback_${Math.random()}`);
                    textField.setText('Signature Here');
                    textField.addToPage(page, {
                      x: pdfX,
                      y: pdfY - ((edit.height || 50) / 1.2),
                      width: (edit.width || 150) / 1.2,
                      height: (edit.height || 50) / 1.2,
                    });
                }
             } catch (e) {
                 console.log("Fallback signature field creation", e);
             }
          } else if (edit.type === 'image' && edit.file) {
             const imageBytes = await edit.file.arrayBuffer();
             let pdfImage;
             if (edit.file.type.includes('png')) {
               pdfImage = await pdfLibDoc.embedPng(imageBytes);
             } else {
               pdfImage = await pdfLibDoc.embedJpg(imageBytes);
             }
             page.drawImage(pdfImage, {
               x: pdfX,
               y: pdfY - ((edit.height || 100) / 1.2),
               width: (edit.width || 100) / 1.2,
               height: (edit.height || 100) / 1.2,
             });
          }
        }
      }

      // Attachments
      for (const file of attachments) {
        const bytes = await file.arrayBuffer();
        await pdfLibDoc.attach(bytes, file.name, {
          mimeType: file.type,
          description: `Attached file: ${file.name}`
        });
      }

      const pdfBytes = await pdfLibDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'edited_document.pdf');
    } catch(e: any) {
      alert('Error applying edits: ' + e.message);
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!file && (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--primary-blue)] mb-2">{t.editPdf}</h1>
            <p className="text-[var(--text-muted)]">{t.editPdfDesc}</p>
          </div>
          <div className="bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm max-w-4xl mx-auto">
            <FileUpload onFileSelect={handleFile} accept="application/pdf" />
          </div>
        </>
      )}

      {file && pdfDoc && (
        <div className="h-[85vh] flex flex-col gap-4">
          
          {/* Top Tools Bar */}
          <div className="w-full bg-[var(--header-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col p-3 md:p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <h3 className="font-bold whitespace-nowrap text-sm md:text-base">{language === 'ar' ? 'أدوات التحرير' : 'Editing Tools'}</h3>
              
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setActiveTool(activeTool === 'text' ? 'none' : 'text')}
                  className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-[10px] md:text-xs font-medium ${activeTool === 'text' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <Type className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {language === 'ar' ? 'نص' : 'Text'}
                </button>

                <button 
                  onClick={() => setActiveTool(activeTool === 'whiteout' ? 'none' : 'whiteout')}
                  className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-[10px] md:text-xs font-medium ${activeTool === 'whiteout' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                  title={language === 'ar' ? 'مسح نص موجود وتعديله' : 'Erase existing text to edit'}
                >
                  <Square className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 fill-white border rounded" />
                  {language === 'ar' ? 'مسح' : 'Whiteout'}
                </button>

                <div>
                   <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                   <label htmlFor="image-upload" className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-[10px] md:text-xs font-medium cursor-pointer ${activeTool === 'image' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}>
                     <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                     {language === 'ar' ? 'صورة' : 'Image'}
                   </label>
                </div>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 md:mx-2 hidden sm:block"></div>

                {/* Forms */}
                <button 
                  onClick={() => setActiveTool(activeTool === 'form_text' ? 'none' : 'form_text')}
                  className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-[10px] md:text-xs font-medium ${activeTool === 'form_text' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <Type className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                  {language === 'ar' ? 'حقل نصي' : 'Text Field'}
                </button>
                <button 
                  onClick={() => setActiveTool(activeTool === 'form_signature' ? 'none' : 'form_signature')}
                  className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-[10px] md:text-xs font-medium ${activeTool === 'form_signature' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                  {language === 'ar' ? 'توقيع' : 'Sign'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0 lg:ml-auto lg:rtl:ml-0 lg:rtl:mr-auto justify-end">
                 <button 
                  onClick={() => setEdits(edits.slice(0, -1))}
                  disabled={edits.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-xs font-medium disabled:opacity-50"
                 >
                  <Undo className="w-4 h-4" />
                  {language === 'ar' ? 'تراجع' : 'Undo'}
                 </button>
                 <button 
                  onClick={() => setEdits([])}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors text-xs font-medium"
                 >
                  <Trash2 className="w-4 h-4" />
                  <span className="bg-red-100 px-1.5 py-0.5 rounded text-[10px]">{edits.length}</span>
                 </button>

                 <button 
                  onClick={handleExport}
                  className="ml-2 rtl:mr-2 rtl:ml-0 px-4 py-1.5 bg-[var(--primary-blue)] text-white text-xs font-bold rounded-lg hover:bg-[var(--primary-blue-hover)] transition-all flex items-center gap-2"
                 >
                  <Download className="w-4 h-4" />
                  {language === 'ar' ? 'تصدير' : 'Export'}
                 </button>
              </div>
            </div>

            {/* Second row of tools (color, annotations, attachments, input text) */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--border-color)]">
              {activeTool === 'text' && (
                <div className="flex items-center gap-2">
                  <textarea 
                    value={currentText}
                    onChange={e => setCurrentText(e.target.value)}
                    placeholder={language === 'ar' ? 'النص المضاف' : 'Text to add'}
                    className="w-48 px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-white dark:bg-slate-700 resize-none h-8" 
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{language === 'ar' ? 'اللون:' : 'Color:'}</label>
                <input 
                  type="color" 
                  value={currentColor}
                  onChange={e => setCurrentColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-[var(--border-color)] p-0" 
                />
              </div>

              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>

              <button 
                onClick={() => setActiveTool(activeTool === 'strikeout' ? 'none' : 'strikeout')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${activeTool === 'strikeout' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
              >
                <div className="w-4 font-bold line-through text-red-500">S</div>
                {language === 'ar' ? 'شطب' : 'Strikeout'}
              </button>

              <button 
                onClick={() => setActiveTool(activeTool === 'form_checkbox' ? 'none' : 'form_checkbox')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${activeTool === 'form_checkbox' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
              >
                <Square className="w-4 h-4 text-blue-500" />
                {language === 'ar' ? 'مربع اختيار' : 'Checkbox'}
              </button>

              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
              
              <div className="flex items-center gap-2">
                 <input type="file" id="attachment-upload" className="hidden" onChange={handleAddAttachment} />
                 <label htmlFor="attachment-upload" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-600">
                   <span className="text-sm">+</span>
                   {language === 'ar' ? 'إرفاق ملف' : 'Attach'}
                 </label>
                 {attachments.length > 0 && (
                   <span className="text-[10px] text-slate-500">
                     ({attachments.length})
                   </span>
                 )}
              </div>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div 
            className="flex-1 bg-[#525659] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] flex flex-col relative w-full h-full min-h-[500px]"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
             <div className="bg-[var(--header-bg)] border-b border-[var(--border-color)] p-2 flex justify-between items-center z-10 shadow-sm relative">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button onClick={() => changePage(-1)} disabled={pageNum <= 1} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4 rtl:hidden" />
                    <ChevronRight className="w-4 h-4 ltr:hidden" />
                  </button>
                  <div className="px-2 font-mono text-[10px] max-w-[80px] text-center">
                    {pageNum} / {pdfDoc.numPages}
                  </div>
                  <button onClick={() => changePage(1)} disabled={pageNum >= pdfDoc.numPages} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50">
                    <ChevronRight className="w-4 h-4 rtl:hidden" />
                    <ChevronLeft className="w-4 h-4 ltr:hidden" />
                  </button>
                </div>
                
                <div className="text-xs font-medium text-[var(--text-muted)] animate-pulse">
                   {activeTool !== 'none' ? (language === 'ar' ? 'انقر على المكان المطلوب لإضافة العنصر' : 'Click anywhere to add element') : ''}
                </div>
             </div>
             
             <div 
               className="flex-1 overflow-auto p-4 flex justify-center items-start bg-[#525659] w-full h-full"
               onClick={() => setSelectedId(null)}
             >
                <div className="relative shadow-2xl bg-white">
                  <canvas 
                    ref={canvasRef} 
                    onClick={handleCanvasClick}
                    className={`${activeTool !== 'none' ? 'cursor-crosshair' : ''}`}
                  />
                  {edits.filter(e => e.pageIndex === pageNum - 1).map(edit => renderEditElement(edit))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
