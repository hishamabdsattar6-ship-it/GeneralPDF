const fs = require('fs');

const data = fs.readFileSync('test_alignment.pdf');
// We can find the stream dictionary... actually let's just grep for "Tm" to see the transform matrix
const str = data.toString('utf8');
const lines = str.split('\n');
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('Tm')) {
      console.log(`Matrix: ${lines[i]}`);
      // Usually the Tj or TL or similar is on the next few lines
      for (let j = 1; j < 5; j++) {
         if (lines[i+j] && lines[i+j].includes('Tj')) {
             console.log(`Text: ${lines[i+j]}`);
         } else if (lines[i+j] && lines[i+j].includes('[')) {
             console.log(`Text Array: ${lines[i+j]}`);
         }
      }
   }
}
