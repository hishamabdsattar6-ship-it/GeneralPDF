import { PDFDocument, PDFFont, rgb, RGB } from 'pdf-lib';
import { reshapeArabic as processArabicText, isArabic } from './arabicUtils';

interface WordWrapOptions {
  page: any;
  pdfDoc: PDFDocument;
  font: PDFFont;
  fontSize: number;
  color: RGB;
  text: string;
  xOffset: number;
  startY: number;
  maxWidth: number;
  lineHeight: number;
  pageWidth: number;
  pageHeight: number;
  headerTitle?: string;
  language?: string;
  themeColor?: RGB;
  headerColor?: RGB;
  borderStyle?: string;
}

const drawPageDecorations = (page: any, width: number, height: number, borderStyle: string = 'none', themeColor: RGB = rgb(0.12, 0.25, 0.68)) => {
  const margin = 20;
  if (borderStyle === 'solid') {
    // A clean, solid border
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      borderColor: themeColor,
      borderWidth: 2,
    });
  } else if (borderStyle === 'double') {
    // Double lines
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      borderColor: themeColor,
      borderWidth: 1,
    });
    page.drawRectangle({
      x: margin + 4,
      y: margin + 4,
      width: width - (margin + 4) * 2,
      height: height - (margin + 4) * 2,
      borderColor: themeColor,
      borderWidth: 1,
    });
  } else if (borderStyle === 'minimal') {
    // Modern minimal: just left and right subtle lines, or corner accents
    const cornerSize = 40;
    const accentParams = { borderColor: themeColor, borderWidth: 3 };
    // Top Left
    page.drawLine({ start: { x: margin, y: height - margin }, end: { x: margin + cornerSize, y: height - margin }, ...accentParams });
    page.drawLine({ start: { x: margin, y: height - margin }, end: { x: margin, y: height - margin - cornerSize }, ...accentParams });
    // Top Right
    page.drawLine({ start: { x: width - margin, y: height - margin }, end: { x: width - margin - cornerSize, y: height - margin }, ...accentParams });
    page.drawLine({ start: { x: width - margin, y: height - margin }, end: { x: width - margin, y: height - margin - cornerSize }, ...accentParams });
    // Bottom Left
    page.drawLine({ start: { x: margin, y: margin }, end: { x: margin + cornerSize, y: margin }, ...accentParams });
    page.drawLine({ start: { x: margin, y: margin }, end: { x: margin, y: margin + cornerSize }, ...accentParams });
    // Bottom Right
    page.drawLine({ start: { x: width - margin, y: margin }, end: { x: width - margin - cornerSize, y: margin }, ...accentParams });
    page.drawLine({ start: { x: width - margin, y: margin }, end: { x: width - margin, y: margin + cornerSize }, ...accentParams });
  }
};

const drawHeaderAndFooter = async (page: any, font: PDFFont, width: number, height: number, pageNum: number, language: string = 'ar', borderStyle?: string, themeColor?: RGB) => {
  if (borderStyle && themeColor) {
    drawPageDecorations(page, width, height, borderStyle, themeColor);
  }

  const pageWord = language === 'ar' ? 'صفحة' : 'Page';
  const footerString = `${pageWord} ${pageNum}`;
  const footerText = footerString;
  const footerWidth = font.widthOfTextAtSize(footerText, 10);

  // GeneralPDF text (Bottom Left)
  page.drawText("GeneralPDF", {
    x: 40,
    y: 20,
    size: 7,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Footer text
  page.drawText(footerText, {
    x: width / 2 - (footerWidth / 2), // centered
    y: 20,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
};

/**
 * Draws a paragraph with proper BiDi (Arabic/LTR) support and alignment.
 * 1. X-Axis Logic: Start X = PageWidth - MarginRight - TextWidth for Arabic.
 * 2. Mixed Direction: Reshape/BiDi ONLY for Arabic text.
 * 3. Collision Avoidance: Calculate textWidth before placement to prevent edge overflow.
 */
export async function drawParagraph(
  pageObj: any,
  text: string,
  options: WordWrapOptions & { currentY: number; pageNum: number },
  isMainTitle: boolean = false
): Promise<{ page: any; currentY: number; pageNum: number }> {
  let { pdfDoc, font, fontSize, color, xOffset, pageWidth, pageHeight, maxWidth, lineHeight, language, pageNum, currentY, themeColor } = options;
  let page = pageObj;

  // Split paragraph into words for custom wrapping
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  const stripFormatting = (str: string) => str.replace(/\*\*/g, '');

  for (let j = 0; j < words.length; j++) {
    const word = words[j];
    const testLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
    
    const strippedTestLine = stripFormatting(testLine);
    const isArabicText = isArabic(strippedTestLine);
    const testLineReshaped = isArabicText ? await processArabicText(strippedTestLine) : strippedTestLine;
    const textWidth = font.widthOfTextAtSize(testLineReshaped, fontSize);

    if (textWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

    const isParaArabic = isArabic(text);
    const effectiveLineHeight = isParaArabic ? (lineHeight || fontSize * 1.9) : (lineHeight || fontSize * 1.5);
    let isBoldContext = false;

    for (const line of lines) {
      if (currentY < 120) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        pageNum++;
        await drawHeaderAndFooter(page, font, pageWidth, pageHeight, pageNum, language, options.borderStyle, options.themeColor);
        currentY = pageHeight - 80;
      }

      const strippedLine = stripFormatting(line);
      const isLineLanguageArabic = isArabic(strippedLine);

      if (isMainTitle || isParaArabic || isLineLanguageArabic) {
        // Draw aligned line (Title or Arabic Content)
        const isCurrentLineArabic = isArabic(strippedLine);
        const textToDraw = isCurrentLineArabic ? await processArabicText(strippedLine) : strippedLine;
        const textWidth = font.widthOfTextAtSize(textToDraw, fontSize);
        
        let drawX;
        const margin = xOffset || 50;
        
        if (isMainTitle) {
          drawX = (pageWidth - textWidth) / 2;
        } else {
          // Force right alignment for Arabic content
          // In RTL, margin is from the right edge
          drawX = pageWidth - margin - textWidth;
        }

        if (!line.includes('**')) {
          page.drawText(textToDraw, {
            x: drawX,
            y: currentY,
            size: fontSize,
            font: font,
            color: color,
            characterSpacing: 0,
          });
        } else {
          const parts = line.split('**');
          const highlights: boolean[] = [];
          let hl = isBoldContext;
          for (let idx = 0; idx < parts.length; idx++) {
            highlights.push(hl);
            if (idx < parts.length - 1) hl = !hl;
          }
          isBoldContext = hl;

          const reshapedParts: string[] = [];
          const partWidths: number[] = [];
          for (let idx = 0; idx < parts.length; idx++) {
            const part = parts[idx];
            const reshaped = isArabic(part) ? await processArabicText(part) : part;
            reshapedParts.push(reshaped);
            partWidths.push(font.widthOfTextAtSize(reshaped, fontSize));
          }

          let currentX = drawX;
          // If the paragraph or line is Arabic dominant, draw parts in RTL visual order
          if (isParaArabic || isLineLanguageArabic) {
            for (let idx = parts.length - 1; idx >= 0; idx--) {
              const pDraw = reshapedParts[idx];
              if (pDraw.length > 0) {
                page.drawText(pDraw, {
                  x: currentX,
                  y: currentY,
                  size: fontSize,
                  font: font,
                  color: highlights[idx] ? (themeColor || color) : color,
                  characterSpacing: 0,
                });
                currentX += partWidths[idx];
              }
            }
          } else {
            // LTR chunk order
            for (let idx = 0; idx < parts.length; idx++) {
              const pDraw = reshapedParts[idx];
              if (pDraw.length > 0) {
                page.drawText(pDraw, {
                  x: currentX,
                  y: currentY,
                  size: fontSize,
                  font: font,
                  color: highlights[idx] ? (themeColor || color) : color,
                  characterSpacing: 0,
                });
                currentX += partWidths[idx];
              }
            }
          }
        }
      } else {
        // English/LTR logic
        const parts = line.split('**');
        const highlights: boolean[] = [];
        let hl = isBoldContext;
        for (let idx = 0; idx < parts.length; idx++) {
          highlights.push(hl);
          if (idx < parts.length - 1) hl = !hl;
        }
        isBoldContext = hl;

        let currentX = xOffset;
        for (let idx = 0; idx < parts.length; idx++) {
          const part = parts[idx];
          if (part.length > 0) {
            page.drawText(part, {
              x: currentX,
              y: currentY,
              size: fontSize,
              font: font,
              color: highlights[idx] ? (themeColor || color) : color,
            });
            currentX += font.widthOfTextAtSize(part, fontSize);
          }
        }
      }

    currentY -= effectiveLineHeight;
  }

  return { page, currentY, pageNum };
}

export const drawTextWithWordWrap = async (options: WordWrapOptions) => {
  let { page, pdfDoc, font, fontSize, color, text, xOffset, startY, maxWidth, lineHeight, pageWidth, pageHeight, headerTitle, language = 'ar', themeColor, headerColor, borderStyle } = options;

  // Sanitize text to remove unsupported glyphs (like emojis) and normalize bullets/dashes
  const sanitizeText = (str: string) => {
    return str
      .replace(/[•◦▪●]/g, '-') // Replace unicode bullets with dash
      .replace(/[—–]/g, '-') // Replace em/en dashes with regular dash
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, ''); // Dingbats
  };

  const sanitizedText = sanitizeText(text);

  let currentY = startY;
  let pageNum = 1;

  // Add styling for the first page
  await drawHeaderAndFooter(page, font, pageWidth, pageHeight, pageNum, language, borderStyle, themeColor);

  // Use a fixed spacing for readability
  const standardLineHeight = fontSize * 1.5;

  const paragraphs = sanitizedText.split(/\n+/).filter(p => p.trim() !== '');

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    let cleanPara = paragraph.trim();
    
    // 2. Tense Styling (Attractive UI/Layout)
    // Detection: Starts with "1." or "2." or is short and separate
    const startsWithNumbering = cleanPara.match(/^\d+[\.\-\)]/);
    const isExplicitHeader = cleanPara.startsWith('#');
    if (isExplicitHeader) {
      cleanPara = cleanPara.replace(/^#+\s*/, '');
    }
    
    // Header logic: numbering, explicit, or short line without ending punctuation
    const isHeader = isExplicitHeader || 
                     startsWithNumbering || 
                     (cleanPara.length > 0 && cleanPara.length < 60 && !cleanPara.match(/[.!?؟:]$/));
    
    // Main title is considered the first paragraph if it's a header
    const isMainTitle = !!(i === 0 && isHeader);

    const currentFontSize = isHeader ? (isMainTitle ? 24 : 16) : fontSize;
    // Apply requested headerColor, otherwise fallback to blue
    const fallbackHeaderColor = rgb(0.12, 0.25, 0.68);
    let currentColor = isHeader ? (headerColor || fallbackHeaderColor) : (color || rgb(0.2, 0.2, 0.2));

    // For non-header text, we will let drawParagraph decode inline **bold** syntax to apply themeColor.

    // Use the newly implemented drawParagraph function
    const result = await drawParagraph(page, cleanPara, {
      ...options,
      fontSize: currentFontSize,
      lineHeight: isHeader ? currentFontSize * 1.5 : standardLineHeight,
      color: currentColor,
      currentY,
      pageNum
    }, isMainTitle);

    page = result.page;
    currentY = result.currentY;
    pageNum = result.pageNum;
    
    // Add extra margin bottom for paragraphs (Line Height 1.5)
    currentY -= standardLineHeight * 0.5;
  }
};

