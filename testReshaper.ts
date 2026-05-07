import arabicReshaper from 'arabic-reshaper';

console.log("Type of arabicReshaper:", typeof arabicReshaper);
if (typeof arabicReshaper === 'object') {
  console.log("Keys:", Object.keys(arabicReshaper));
  if (arabicReshaper.convertArabic) {
    console.log("Output:", arabicReshaper.convertArabic("مرحبا"));
  }
} else if (typeof arabicReshaper === 'function') {
  console.log("Output:", arabicReshaper("مرحبا"));
} else {
  console.log("What is it?", arabicReshaper);
}
