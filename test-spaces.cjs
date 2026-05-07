const arabicReshaper = require('arabic-reshaper');
const bidi = require('bidi-js');
const engine = bidi();
function doReorder(t) {
  const reshaped = arabicReshaper.convertArabic(t);
  const levels = engine.getEmbeddingLevels(reshaped);
  return engine.getReorderedString(reshaped, levels);
}
console.log('Result1:', doReorder("أنا "));
console.log('Result2:', doReorder("أحب"));
console.log('Result3:', doReorder(" التفاح"));
