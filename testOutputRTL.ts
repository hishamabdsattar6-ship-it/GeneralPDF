import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import { drawTextWithWordWrap } from './src/utils/pdfGenerator';
import { isArabic } from './src/utils/arabicUtils';

async function run() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  
  const cairoRes = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf');
  const fontBytes = await cairoRes.arrayBuffer();
  const font = await pdfDoc.embedFont(new Uint8Array(fontBytes));

  const page = pdfDoc.addPage([595.28, 841.89]);
  
  await drawTextWithWordWrap({
    page,
    pdfDoc,
    font,
    fontSize: 14,
    color: rgb(0.2, 0.2, 0.2),
    text: "مرحبا بالعالم. هذا نص تجريبي باللغة العربية. الذكاء الاصطناعي رائع.",
    xOffset: 50,
    startY: 700,
    maxWidth: 400,
    lineHeight: 20,
    pageWidth: 595.28,
    pageHeight: 841.89,
    language: 'ar'
  });

  const bytes = await pdfDoc.save();
  fs.writeFileSync('test_output.pdf', bytes);
  console.log("PDF saved!");
}
run();
