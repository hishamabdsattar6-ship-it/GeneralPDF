import bidiFactory from 'bidi-js';
import { customReshape } from './src/utils/arabicReshaperLogic';

async function run() {
  const bidi = bidiFactory();
  const original = "This is english text. مرحبا بكم";
  const reshaped = customReshape(original);
  
  const levels = bidi.getEmbeddingLevels(reshaped, 'rtl');
  const visual = bidi.getReorderedString(reshaped, levels);
  
  console.log("Original   :", original);
  console.log("Visual     :", visual);
}
run();
