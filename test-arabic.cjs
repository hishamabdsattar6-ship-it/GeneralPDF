const arabicReshaper = require('arabic-reshaper');
const bidi = require('bidi-js');
console.log(arabicReshaper);
console.log(typeof arabicReshaper);
console.log(arabicReshaper.default);
if (typeof arabicReshaper === 'function') {
  console.log(arabicReshaper('محمد'));
} else {
  console.log('not func');
}
