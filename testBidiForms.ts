import bidiFactory from 'bidi-js';
const engine = bidiFactory();
const inputStr = '\uFE9D\uFEA4\uFEE3\uFEAA'; // محمد reshaped
const levels = engine.getEmbeddingLevels(inputStr, 'rtl');
const visual = engine.getReorderedString(inputStr, levels);

console.log("Input:", inputStr);
console.log("Visual:", visual);
console.log("Reversed manually:", inputStr.split('').reverse().join(''));
console.log("Does Bidi reverse it?", inputStr !== visual);
