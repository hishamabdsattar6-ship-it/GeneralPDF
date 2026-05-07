import bidiFactory from 'bidi-js';
import { customReshape } from './src/utils/arabicReshaperLogic';

async function run() {
  const bidi = bidiFactory();
  const text = customReshape("مرحبا بالعالم أنا هنا");
  const levels = bidi.getEmbeddingLevels(text, 'rtl');
  const visual = bidi.getReorderedString(text, levels);
  
  console.log("Original   :", "مرحبا بالعالم أنا هنا");
  console.log("Reshaped   :", text);
  console.log("Visual     :", visual);
}
run();
