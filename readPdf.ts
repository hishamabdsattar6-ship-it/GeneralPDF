import fs from 'fs';
const file = process.argv[2] || 'test.pdf';
const pdf = fs.readFileSync(file, 'utf8');

const tjs = pdf.match(/\(([^)]+)\) Tj/ig);
if (tjs) {
  console.log("Draw operations:");
  for (const tj of tjs) {
    console.log(tj);
  }
}

const hexes = pdf.match(/<([0-9A-Fa-f]+)> Tj/ig);
if (hexes) {
  console.log("Hex operations:");
  for (const h of hexes) {
    console.log(h);
  }
}
