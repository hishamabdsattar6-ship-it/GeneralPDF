import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';

async function run() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  
  const cairoRes = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf');
  const fontBytes = await cairoRes.arrayBuffer();
  const font = await pdfDoc.embedFont(new Uint8Array(fontBytes));

  const page = pdfDoc.addPage([595.28, 841.89]);
  
  const text = "مرحبا بالعالم. هذا نص عربي طويل.";
  
  // Directly pass RAW text to PDF-lib
  page.drawText(text, {
    x: 50,
    y: 700,
    size: 20,
    font,
    color: rgb(0,0,0)
  });

  const width = font.widthOfTextAtSize(text, 20);
  console.log("Calculated width:", width);

  const bytes = await pdfDoc.save();
  fs.writeFileSync('test_raw.pdf', bytes);
  console.log("PDF saved!");
}
run();
