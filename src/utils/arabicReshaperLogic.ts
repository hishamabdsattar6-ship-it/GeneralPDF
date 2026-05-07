export const arabicChars = {
  'ا': ['\uFE8D', '\uFE8E', '\uFE8D', '\uFE8E'],
  'أ': ['\uFE83', '\uFE84', '\uFE83', '\uFE84'],
  'إ': ['\uFE87', '\uFE88', '\uFE87', '\uFE88'],
  'آ': ['\uFE81', '\uFE82', '\uFE81', '\uFE82'],
  'ب': ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'],
  'ت': ['\uFE95', '\uFE96', '\uFE97', '\uFE98'],
  'ث': ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'],
  'ج': ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'],
  'ح': ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'],
  'خ': ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'],
  'د': ['\uFEA9', '\uFEAA', '\uFEA9', '\uFEAA'],
  'ذ': ['\uFEAB', '\uFEAC', '\uFEAB', '\uFEAC'],
  'ر': ['\uFEAD', '\uFEAE', '\uFEAD', '\uFEAE'],
  'ز': ['\uFEAF', '\uFEB0', '\uFEAF', '\uFEB0'],
  'س': ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'],
  'ش': ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'],
  'ص': ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'],
  'ض': ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'],
  'ط': ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'],
  'ظ': ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'],
  'ع': ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'],
  'غ': ['\uFECD', '\uFECE', '\uFECF', '\uFED0'],
  'ف': ['\uFED1', '\uFED2', '\uFED3', '\uFED4'],
  'ق': ['\uFED5', '\uFED6', '\uFED7', '\uFED8'],
  'ك': ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'],
  'ل': ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'],
  'م': ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'],
  'ن': ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'],
  'ه': ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'],
  'و': ['\uFEED', '\uFEEE', '\uFEED', '\uFEEE'],
  'ي': ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'],
  'ى': ['\uFEEF', '\uFEF0', '\uFEEF', '\uFEF0'],
  'ة': ['\uFE93', '\uFE94', '\uFE93', '\uFE94'],
  'ئ': ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'],
  'ؤ': ['\uFE85', '\uFE86', '\uFE85', '\uFE86'],
  'ء': ['\uFE80', '\uFE80', '\uFE80', '\uFE80'],
  // Add Persian letters used often in AI outputs
  'ی': ['\uFBFC', '\uFBFD', '\uFBFE', '\uFBFF'],
  'ک': ['\uFB8E', '\uFB8F', '\uFB90', '\uFB91'],
  'گ': ['\uFB92', '\uFB93', '\uFB94', '\uFB95'],
  'چ': ['\uFB7A', '\uFB7B', '\uFB7C', '\uFB7D'],
  'پ': ['\uFB56', '\uFB57', '\uFB58', '\uFB59'],
  'ژ': ['\uFB8A', '\uFB8B', '\uFB8A', '\uFB8B'],
};

// letters that DO NOT connect to the left
export const rightConnecting = ['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة', 'ى', 'ء', 'ژ'];

export function customReshape(text: string): string {
  let res = '';
  // Handle Lam-Alif ligatures first before processing individual characters
  const replacedText = text
    .replace(/لا/g, '\uFEFB')
    .replace(/لأ/g, '\uFEF7')
    .replace(/لإ/g, '\uFEF9')
    .replace(/لآ/g, '\uFEF5');

  for (let i = 0; i < replacedText.length; i++) {
    const char = replacedText[i];
    const prev = i > 0 ? replacedText[i - 1] : '';
    const next = i < replacedText.length - 1 ? replacedText[i + 1] : '';

    const isArabic = arabicChars[char as keyof typeof arabicChars];
    if (!isArabic) {
      res += char;
      continue;
    }

    const prevConnects = prev && arabicChars[prev as keyof typeof arabicChars] && !rightConnecting.includes(prev) && prev !== '\uFEFB' && prev !== '\uFEF7' && prev !== '\uFEF9' && prev !== '\uFEF5';
    const nextConnects = next && arabicChars[next as keyof typeof arabicChars];

    if (prevConnects && nextConnects) {
      res += arabicChars[char as keyof typeof arabicChars][3]; // Medial
    } else if (prevConnects) {
      res += arabicChars[char as keyof typeof arabicChars][1]; // Final
    } else if (nextConnects) {
      res += arabicChars[char as keyof typeof arabicChars][2]; // Initial
    } else {
      res += arabicChars[char as keyof typeof arabicChars][0]; // Isolated
    }
  }
  return res;
}
