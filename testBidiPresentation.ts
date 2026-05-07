import bidiFactory from 'bidi-js';
import arabicReshaper from 'arabic-reshaper';

async function run() {
  const bidi = bidiFactory();
  
  const original = "مرحبا بالعالم";
  const reshaped = arabicReshaper.convertArabic(original);
  
  const levels = bidi.getEmbeddingLevels(reshaped, 'rtl');
  const visual = bidi.getReorderedString(reshaped, levels);
  
  console.log("Original   :", original);
  console.log("Reshaped   :", reshaped);
  console.log("Visual     :", visual);
  
  for (let i=0; i<visual.length; i++) {
    console.log(visual[i], visual.charCodeAt(i).toString(16));
  }
}
run();
