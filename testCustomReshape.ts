import { customReshape } from './src/utils/arabicReshaperLogic';
import { processArabicText } from './src/utils/arabicUtils';

async function test() {
  const original = "مرحبا بالعالم";
  const custom = customReshape(original);
  console.log("Original   :", original);
  console.log("Custom     :", custom);
  
  const processed = await processArabicText(original);
  console.log("Processed  :", processed);
}
test();
