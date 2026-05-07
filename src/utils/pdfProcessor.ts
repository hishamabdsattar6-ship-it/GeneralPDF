import * as pdfjsLib from 'pdfjs-dist';
import { createWorker, createScheduler } from 'tesseract.js';
import { useAppStore } from '../store/useAppStore';
import { getCachedOcr, setCachedOcr, generateFileHash } from './cache';
import toast from 'react-hot-toast';

// @ts-expect-error worker url
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface PageContent {
  text: string;
  isImageBased: boolean;
  imageData?: string; // base64
}

export const validatePdf = async (file: File): Promise<boolean> => {
  const buffer = await file.slice(0, 5).arrayBuffer();
  const header = new TextDecoder().decode(buffer);
  return header.startsWith('%PDF-');
};

export const detectAndProcessPdf = async (file: File): Promise<PageContent[]> => {
  const { setOcrProcessing, setProgress, language } = useAppStore.getState();
  
  const isPdf = await validatePdf(file);
  const isImage = file.type.startsWith('image/');

  if (!isPdf && !isImage) {
    toast.error(language === 'ar' ? 'ملف غير صالح' : 'Invalid file format');
    throw new Error('Invalid PDF magic bytes or unsupported image');
  }

  const fileHash = await generateFileHash(file);
  let pageContents: PageContent[] = [];

  // Handle direct image files
  if (isImage) {
    setOcrProcessing(true);
    setProgress(10);
    
    const cached = await getCachedOcr(fileHash, 1);
    if (cached) {
      setOcrProcessing(false);
      setProgress(100);
      return [{ text: cached, isImageBased: true }];
    }

    const reader = new FileReader();
    const imageData = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const ocrText = await performSingleOcr(imageData, (p) => {
      setProgress(Math.round(p * 100));
    });

    await setCachedOcr(fileHash, 1, ocrText);
    setOcrProcessing(false);
    setProgress(100);
    
    return [{
      text: ocrText,
      isImageBased: true,
      imageData: imageData.split(',')[1]
    }];
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
    disableFontFace: true
  }).promise;
  const maxPages = Math.min(pdf.numPages, 50); // Restore 50 pages limit for stability
  
  let scansDetected = false;

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ').trim();

    const cached = await getCachedOcr(fileHash, i);
    if (cached) {
      pageContents.push({ text: cached, isImageBased: true });
      setProgress(Math.round((i / maxPages) * 100));
      continue;
    }

    if (text.length < 50) {
      if (!scansDetected) {
        scansDetected = true;
        toast(
          language === 'ar' 
            ? "هذا المستند ممسوح ضوئياً، جاري تحسين الجودة ومعالجة النصوص بدقة عالية، قد يستغرق هذا وقتاً طويلاً..." 
            : "This document is scanned, performing high-quality text extraction, this may take a long time...",
          { icon: '🔍' }
        );
      }

      setOcrProcessing(true);
      
      // Maximize quality: Use 3.0 scale for higher resolution OCR scanning
      const viewport = page.getViewport({ scale: 3.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      // Set canvas size matching the high-res viewport
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        
        // High quality blob
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        
        if (blob) {
           const ocrText = await performSingleOcr(blob, (p) => {
             const overallProgress = ((i - 1) / maxPages * 100) + (p * (100 / maxPages));
             setProgress(Math.round(overallProgress));
           });

           // Convert blob to base64 for preview storage if needed
           const reader = new FileReader();
           const base64 = await new Promise<string>((resolve) => {
             reader.onload = () => resolve((reader.result as string).split(',')[1]);
             reader.readAsDataURL(blob);
           });

           pageContents.push({
             text: ocrText,
             isImageBased: true,
             imageData: base64
           });
           await setCachedOcr(fileHash, i, ocrText);
        }
      }
    } else {
      pageContents.push({
        text,
        isImageBased: false
      });
    }
    
    setProgress(Math.round((i / maxPages) * 100));
  }

  setOcrProcessing(false);
  setProgress(100);
  return pageContents;
};

const performSingleOcr = async (image: string | Blob, onProgress: (p: number) => void): Promise<string> => {
  const worker = await createWorker('ara+eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress(m.progress);
      }
    }
  });
  
  const { data: { text } } = await worker.recognize(image);
  await worker.terminate();
  return text;
};
