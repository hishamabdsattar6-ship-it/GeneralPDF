import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { processArabicText } from './src/utils/arabicUtils';
import fs from 'fs';

async function generate() {
  const cairoRes = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf');
  const fontBytes = await cairoRes.arrayBuffer();

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.addPage([500, 500]);
  
  const original = 'مرحبا بالعالم';
  const processed = await processArabicText(original);
  
  page.drawText(processed, {
    x: 50,
    y: 400,
    size: 30,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  const rawFallback = original.split('').reverse().join('');
  page.drawText(rawFallback, {
    x: 50,
    y: 350,
    size: 30,
    font: customFont,
    color: rgb(1, 0, 0), // red
  });

  page.drawText(original, {
    x: 50,
    y: 300,
    size: 30,
    font: customFont,
    color: rgb(0, 0, 1), // blue
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test.pdf', pdfBytes);
  console.log("PDF generated!");
}
generate();
