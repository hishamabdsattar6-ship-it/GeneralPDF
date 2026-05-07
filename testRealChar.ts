import { processArabicText } from './src/utils/arabicUtils';

async function main() {
   const output = await processArabicText("نص تجريبي هنا");
   for(let i=0; i<output.length; i++) {
     console.log(`char[${i}]: ${output[i]} (${output.charCodeAt(i).toString(16)})`);
   }
}

main().catch(console.error);
