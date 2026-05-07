import { processArabicText } from './src/utils/arabicUtils';

async function test() {
  const texts = [
    "مرحباً بالعالم",
    "اختبار الذكاء الاصطناعي",
    "Here is **text** mixed مع عربي"
  ];
  for (const t of texts) {
    console.log("---------------");
    console.log("Original:", t);
    console.log("Processed:", await processArabicText(t));
  }
}
test();
