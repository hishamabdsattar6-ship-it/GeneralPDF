import bidiFactory from 'bidi-js';
import { customReshape } from './src/utils/arabicReshaperLogic';

async function run() {
  const bidi = bidiFactory();
  const text = customReshape("هذا نص عربي طويل");
  const levels = bidi.getEmbeddingLevels(text, 'rtl');
  const visual = bidi.getReorderedString(text, levels);
  
  console.log("Original   :", "هذا نص عربي طويل");
  console.log("Visual     :", visual);
}
run();
