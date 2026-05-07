const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const arabicReshaper = require('arabic-reshaper');

async function main() {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    // Fetch a standard Arabic font
    const res = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf');
    const fontBytes = await res.arrayBuffer();
    const customFont = await pdfDoc.embedFont(fontBytes);
    
    const page = pdfDoc.addPage([500, 500]);
    
    const rawText = "نص تجريبي هنا";
    // 1. Reshape
    // Using default reshaper settings
    const reshaped = arabicReshaper.convertArabic(rawText);
    
    const size = 30;
    const textWidth = customFont.widthOfTextAtSize(reshaped, size);
    
    // Test 1: x = 250 (Mid page)
    page.drawText(reshaped, {
        x: 250,
        y: 400,
        size: size,
        font: customFont
    });
    
    // Test 2: Standard LTR text at 250
    page.drawText("Test String LTR", {
        x: 250,
        y: 350,
        size: size,
        font: customFont
    });

    const out = await pdfDoc.save();
    fs.writeFileSync('test_alignment.pdf', out);
    console.log(`Text Width: ${textWidth}`);
    console.log("PDF saved to test_alignment.pdf");
}

main().catch(console.error);
