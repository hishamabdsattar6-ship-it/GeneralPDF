import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import { drawTextWithWordWrap } from './src/utils/pdfGenerator.js';
import fontkit from '@pdf-lib/fontkit';

async function generateTest() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([595, 842]);
  
  const fontRes = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf');
  const fontBytes = await fontRes.arrayBuffer();
  const customFont = await pdfDoc.embedFont(fontBytes);

  try {
    await drawTextWithWordWrap({
      page,
      pdfDoc,
      font: customFont,
      fontSize: 14,
      color: rgb(0, 0, 0),
      text: "مقدمة في مفهوم الاستدامة\nهذا نص تجريبي للتأكد من ربط الحروف بشكل صحيح.",
      xOffset: 50,
      startY: 800,
      maxWidth: 400,
      lineHeight: 20,
      pageWidth: 595,
      pageHeight: 842
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test.pdf', pdfBytes);
    console.log('test.pdf generated');
  } catch (e) {
    console.error(e);
  }
}
generateTest();
