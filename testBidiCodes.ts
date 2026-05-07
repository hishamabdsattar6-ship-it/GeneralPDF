import bidiFactory from 'bidi-js';
import { customReshape } from './src/utils/arabicReshaperLogic';

async function run() {
  const bidi = bidiFactory();
  const text = customReshape("هذا نص عربي طويل");
  const levels = bidi.getEmbeddingLevels(text, 'rtl');
  const visual = bidi.getReorderedString(text, levels);
  
  for (let i=0; i<visual.length; i++) {
    console.log(visual[i], visual.charCodeAt(i).toString(16));
  }
}
run();
