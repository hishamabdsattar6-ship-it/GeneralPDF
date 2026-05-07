import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { processArabicText, isArabic } from '../../utils/arabicUtils';

// --- Function 1: Generate PDF from scratch ---
export async function generateInteractivePDF(formConfig: any) {
  const { fields, pageSize = [595, 842], formName } = formConfig;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontUrl = 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvalIvTp0ij0R2.woff2';
  const fontBytes = await fetch(fontUrl).then(r => r.arrayBuffer());
  const arabicFont = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.addPage(pageSize);
  const form = pdfDoc.getForm();

  for (const field of fields) {
    const { type, x, y, width, height, label, name, options, required } = field;
    const pdfY = pageSize[1] - y - height;

    if (label) {
      let reversedLabel = label;
      if (isArabic(label)) {
        reversedLabel = await processArabicText(label);
      }
      page.drawText(reversedLabel, {
        x: x,
        y: pdfY + height + 4,
        size: field.fontSize || 12,
        font: arabicFont,
        color: rgb(0.1, 0.1, 0.1),
      });
    }

    switch (type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number': {
        const textField = form.createTextField(name || `field_${Date.now()}`);
        textField.setText('');
        if (field.multiline) textField.enableMultiline();
        if (required) textField.enableRequired();
        textField.addToPage(page, {
          x, y: pdfY, width, height,
          textColor: rgb(0, 0, 0),
          backgroundColor: rgb(0.97, 0.97, 1),
          borderColor: rgb(0.6, 0.6, 0.8),
          borderWidth: 1,
          font: arabicFont,
        });
        break;
      }

      case 'checkbox': {
        const checkbox = form.createCheckBox(name || `cb_${Date.now()}`);
        if (required) checkbox.enableRequired();
        checkbox.addToPage(page, {
          x, y: pdfY, width: height, height,
          backgroundColor: rgb(1, 1, 1),
          borderColor: rgb(0.3, 0.3, 0.8),
          borderWidth: 1.5,
        });
        break;
      }

      case 'radio': {
        const radioGroup = form.createRadioGroup(name || `rg_${Date.now()}`);
        const optionWidth = width / (options?.length || 1);
        (options || []).forEach((opt: any, i: number) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          radioGroup.addOptionToPage(val, page, {
            x: x + i * optionWidth,
            y: pdfY,
            width: height,
            height,
          });
        });
        if (required) radioGroup.enableRequired();
        break;
      }

      case 'dropdown': {
        const dropdown = form.createDropdown(name || `dd_${Date.now()}`);
        const optionValues = (options || []).map((o: any) =>
          typeof o === 'string' ? o : o.value
        );
        dropdown.addOptions(optionValues);
        if (required) dropdown.enableRequired();
        dropdown.addToPage(page, {
          x, y: pdfY, width, height,
          backgroundColor: rgb(0.97, 0.97, 1),
          borderColor: rgb(0.6, 0.6, 0.8),
          borderWidth: 1,
          font: arabicFont,
        });
        break;
      }

      case 'signature': {
        const sigField = form.createTextField(name || `sig_${Date.now()}`);
        sigField.addToPage(page, {
          x, y: pdfY, width, height,
          backgroundColor: rgb(0.98, 0.98, 0.98),
          borderColor: rgb(0.2, 0.2, 0.2),
          borderWidth: 0,
        });
        page.drawLine({
          start: { x, y: pdfY },
          end: { x: x + width, y: pdfY },
          thickness: 1,
          color: rgb(0.2, 0.2, 0.2),
        });
        break;
      }
    }
  }

  pdfDoc.setTitle(formName || 'نموذج تفاعلي');
  pdfDoc.setLanguage('ar');
  pdfDoc.setCreator('PDF Forms Builder');

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// --- Function 2: Fill existing PDF ---
export async function fillExistingPDF(pdfFile: File, fields: any[], formData: any) {
  const existingPdfBytes = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const fontUrl = 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvalIvTp0ij0R2.woff2';
  const fontBytes = await fetch(fontUrl).then(r => r.arrayBuffer());
  const arabicFont = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();

  try {
    const form = pdfDoc.getForm();
    const existingFields = form.getFields();
    existingFields.forEach((field: any) => {
      const fieldName = field.getName();
      if (formData[fieldName] !== undefined) {
        if (field.constructor.name === 'PDFTextField') {
          field.setText(String(formData[fieldName]));
        } else if (field.constructor.name === 'PDFCheckBox') {
          formData[fieldName] ? field.check() : field.uncheck();
        } else if (field.constructor.name === 'PDFDropdown') {
          field.select(formData[fieldName]);
        }
      }
    });
  } catch (e) {
    // PDF no form found
  }

  for (const field of fields) {
    const pdfY = pageHeight - field.y - field.height;

    if (field.type === 'text' && formData[field.name]) {
      const isArabic = /[\u0600-\u06FF]/.test(String(formData[field.name]));
      let text = String(formData[field.name]);
      if (isArabic) {
        try {
           const { processArabicText } = await import('../../utils/arabicUtils');
           text = await processArabicText(text);
        } catch (e) {
           console.error("Failed to reshape", e);
        }
      }
      
      firstPage.drawText(text, {
        x: field.x,
        y: pdfY + (field.height / 2) - 6,
        size: field.fontSize || 12,
        font: arabicFont,
        color: rgb(0, 0, 0.1),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// --- Function 3: Process Arabic ---
export function reverseArabicText(text: string) {
  if (!text) return '';
  const arabicRegex = /[\\u0600-\\u06FF]/;
  if (!arabicRegex.test(text)) return text;
  
  return text
    .split('\\n')
    .map(line =>
      line
        .split(' ')
        .reverse()
        .join(' ')
    )
    .join('\\n');
}

// --- Function 4: Download PDF ---
export function downloadPDF(pdfBytes: Uint8Array, filename = 'نموذج.pdf') {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Function 5: Build form config ---
export function buildFormConfig(canvasFields: any[], formName: string) {
  return {
    formName,
    pageSize: [794, 1123],
    fields: canvasFields.map(f => ({
      type: f.type,
      name: f.name || `${f.type}_${f.id}`,
      label: f.label,
      x: f.x,
      y: f.y,
      width: f.width,
      height: f.height,
      fontSize: f.fontSize || 12,
      required: f.required || false,
      options: f.options || [],
      multiline: f.multiline || false,
      placeholder: f.placeholder || '',
    })),
  };
}
