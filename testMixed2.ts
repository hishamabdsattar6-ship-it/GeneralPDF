import bidiFactory from 'bidi-js';
import { customReshape } from './src/utils/arabicReshaperLogic';

async function run() {
  const bidi = bidiFactory();
  const text = customReshape("تطلق Apple نسخة");
  const levels = bidi.getEmbeddingLevels(text, 'rtl');
  const visual = bidi.getReorderedString(text, levels);
  
  console.log("Original   :", "تطلق Apple نسخة");
  console.log("Visual     :", visual);
}
run();
