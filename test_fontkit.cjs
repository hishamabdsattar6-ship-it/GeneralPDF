const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const arabicReshaper = require('arabic-reshaper');

async function createPdf() {
   const pdfDoc = await PDFDocument.create();
   pdfDoc.registerFontkit(fontkit);
   
   // Fetch Cairo font or use a local one. We will fetch Amiri from google fonts.
   const fontRes = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf');
   const fontBytes = await fontRes.arrayBuffer();
   const customFont = await pdfDoc.embedFont(fontBytes);
   
   const page = pdfDoc.addPage([500, 500]);
   
   // text
   const rawText = "نص تجريبي هنا";
   const reshapedText = arabicReshaper.convertArabic(rawText);
   
   // Draw Reshaped (Logical Order)
   page.drawText(reshapedText, {
       x: 250,
       y: 400,
       size: 30,
       font: customFont
   });
   
   // Draw Reversed Manual
   page.drawText(reshapedText.split('').reverse().join(''), {
       x: 250,
       y: 350,
       size: 30,
       font: customFont
   });

   const pdfBytesResult = await pdfDoc.save();
   fs.writeFileSync('test_fontkit.pdf', pdfBytesResult);
   console.log("PDF generated!");
}
createPdf();
