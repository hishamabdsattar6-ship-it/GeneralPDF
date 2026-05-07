import { processArabicText } from './src/utils/arabicUtils';

async function main() {
   const input = "نص تجريبي هنا";
   console.log("Input:", input);
   const output = await processArabicText(input);
   console.log("Output:", output);
   console.log("Expected (if reversed properly): ﺎﻨﻫ ﻲﺒﻳﺮﺠﺗ ﺺﻧ");
   console.log("Reversed manually:", output.split('').reverse().join(''));
}

main().catch(console.error);
