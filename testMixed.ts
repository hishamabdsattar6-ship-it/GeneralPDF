import bidiFactory from 'bidi-js';
import { customReshape } from './src/utils/arabicReshaperLogic';

async function run() {
  const bidi = bidiFactory();
  const text = customReshape("Hello بالعالم");
  const levels = bidi.getEmbeddingLevels(text, 'rtl');
  const visual = bidi.getReorderedString(text, levels);
  
  console.log("Original   :", "Hello بالعالم");
  console.log("Reshaped   :", text);
  console.log("Visual     :", visual);
}
run();
