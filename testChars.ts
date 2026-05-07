import { processArabicText } from './src/utils/arabicUtils';

async function test() {
  const t = "مرحباً بالعالم";
  const processed = await processArabicText(t);
  console.log("Original chars:");
  for (let i=0; i<t.length; i++) console.log(t[i], t.charCodeAt(i).toString(16));
  
  console.log("Processed chars:");
  for (let i=0; i<processed.length; i++) console.log(processed[i], processed.charCodeAt(i).toString(16));
}
test();
