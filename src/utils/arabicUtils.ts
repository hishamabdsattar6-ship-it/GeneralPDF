// @ts-ignore
import arabicReshaper from 'arabic-reshaper';
// @ts-ignore
import bidiFactory from 'bidi-js';

import { customReshape } from './arabicReshaperLogic';

// Handle different module export styles robustly
const getReshaper = () => {
  try {
    const r: any = (arabicReshaper as any).default || arabicReshaper;
    // Some versions export as a function directly, others as an object with convertArabic
    if (typeof r.convertArabic === 'function') return r;
    if (typeof r === 'function') return { convertArabic: r };
    // Fallback search in properties
    for (const key in r) {
      if (typeof r[key]?.convertArabic === 'function') return r[key];
    }
    return r;
  } catch (e) {
    console.error('Reshaper initialization failed:', e);
    return null;
  }
};

let bidiEngine: any = null;

const getBidi = () => {
  if (bidiEngine) return bidiEngine;
  try {
    const factory = (bidiFactory as any).default || bidiFactory;
    if (typeof factory === 'function') {
      bidiEngine = factory();
    } else if (factory && typeof (factory as any).getEmbeddingLevels === 'function') {
      bidiEngine = factory;
    }
    return bidiEngine;
  } catch (e) {
    console.error('Bidi engine initialization failed:', e);
    return null;
  }
};

export const isArabic = (text: string): boolean => {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
};

export const processArabicText = async (text: string): Promise<string> => {
  if (!text || !isArabic(text)) return text;
  
  // Strip Arabic diacritics (tashkeel) which often cause reshaping and PDF rendering issues (empty rectangles)
  // \u064B to \u065F are the standard Arabic diacritics
  let processedText = text.replace(/[\u064B-\u065F]/g, '');
  
  // 1. Reshape
  let reshapedSuccessfully = false;
  try {
    const reshaper = getReshaper();
    if (reshaper && typeof reshaper.convertArabic === 'function') {
      processedText = reshaper.convertArabic(processedText);
      reshapedSuccessfully = true;
    } else if (typeof reshaper === 'function') {
      processedText = reshaper(processedText);
      reshapedSuccessfully = true;
    }
  } catch (e) {
    console.warn('arabic-reshaper failed:', e);
  }

  // Guaranteed Reshape Fallback if the module failed in browser
  if (!reshapedSuccessfully || processedText === text) {
    try {
      processedText = customReshape(text);
    } catch(e) {
      console.warn("customReshape failed", e);
    }
  }

  // We DO NOT use bidi-js or manual string reverse here, because pdf-lib + fontkit
  // properly handles the RTL ordering on the canvas for Arabic Unicode blocks 
  // (both standard and presentation forms). It just fails to reshape them!
  // So returning the reshaped string in LOGICAL order is correct.
  return processedText;
};

export const reshapeArabic = processArabicText;
