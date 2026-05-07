const arabicReshaper = require('arabic-reshaper');
const bidi = require('bidi-js');
const reshaped = arabicReshaper.convertArabic('مرحبا للعالم');
const engine = bidi();
console.log(engine);
if (typeof engine.getDisplay === 'function') {
  console.log(engine.getDisplay(reshaped));
} else {
  const levels = engine.getEmbeddingLevels(reshaped);
  const reordered = engine.getReorderedString(reshaped, levels);
  console.log(reordered);
}
