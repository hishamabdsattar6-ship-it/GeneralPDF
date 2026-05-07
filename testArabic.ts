import { processArabicText } from './src/utils/arabicUtils';

async function test() {
  const t1 = "مرحبا بالعالم";
  const processed = await processArabicText(t1);
  console.log("Original:", t1);
  console.log("Processed:", processed);
}

test();
