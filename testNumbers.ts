import bidiFactory from 'bidi-js';
import { customReshape } from './src/utils/arabicReshaperLogic';

async function run() {
  const bidi = bidiFactory();
  const text = customReshape("أنا عمري ٢٥ سنة"); // 25
  const levels = bidi.getEmbeddingLevels(text, 'rtl');
  const visual = bidi.getReorderedString(text, levels);
  
  console.log("Original   :", "أنا عمري ٢٥ سنة");
  console.log("Visual     :", visual);
}
run();
