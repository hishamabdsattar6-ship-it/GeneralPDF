import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

async function testPdfLibFont() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf');
    const bytes = await res.arrayBuffer();
    
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const font = await pdfDoc.embedFont(bytes);
    console.log("Successfully embedded Cairo Variable Font!", font.name);
  } catch (e) {
    console.error("Failed to embed font", e);
  }
}
testPdfLibFont();
