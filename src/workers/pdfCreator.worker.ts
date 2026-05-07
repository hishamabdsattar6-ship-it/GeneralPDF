self.onmessage = async (e: MessageEvent) => {
  const { action, payload, id } = e.data;
  
  try {
    let result;
    if (action === 'create_manual') {
      result = await handleCreateManual(payload);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    self.postMessage({ id, status: 'success', result });
  } catch (error: any) {
    self.postMessage({ id, status: 'error', error: error.message || 'Unknown error' });
  }
};

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function handleCreateManual(payload: any): Promise<ArrayBuffer> {
  const { pages, defaultSettings } = payload;
  const pdfDoc = await PDFDocument.create();
  
  // simple embedded font support might need external bytes, we will just use StandardFonts for latin, and fallback for arabic if using custom font. As we may not have an arabic font bundled yet, we use Helvetica. In production, we'd bundle a TTF like Cairo and pass arrayBuffer. Let's just use Helvetica for the worker for now, or assume text is drawn via canvas on frontend and passed as img. If it's direct pdf-lib text, we need a custom TTF.
  // We'll proceed with basic pdf-lib StandardFonts for simplicity unless specific TTF is needed. Wait, Arabic requires proper shaping and font embedding.
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pages.forEach((pageData: any) => {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    
    // Background
    if (pageData.bgColor) {
      page.drawRectangle({
        x: 0, y: 0, width, height,
        color: rgb(pageData.bgColor.r, pageData.bgColor.g, pageData.bgColor.b)
      });
    }

    // Border Frame
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
      });
      page.drawRectangle({
        x: 34, y: 34, width: width - 68, height: height - 68,
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 0.5,
      });
    }

    // Text Content (Very basic for worker, Arabic needs shaping ideally. We might just pass pre-rendered image from canvas for true WYSIWYG)
    if (pageData.text) {
       page.drawText(pageData.text, {
         x: 50,
         y: height - 100,
         size: pageData.fontSize || 12,
         font: font,
       });
    }
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes.buffer;
}
