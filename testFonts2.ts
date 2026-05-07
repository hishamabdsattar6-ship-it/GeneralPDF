async function testFonts2() {
  const cairoUrls = [
    'https://unpkg.com/@fontsource/cairo@4.5.10/files/cairo-arabic-400-normal.woff2', // woff2
    'https://cdn.jsdelivr.net/npm/@fontsource/cairo/files/cairo-arabic-400-normal.woff2', // woff2
    'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf', // google fonts repo often uses variable fonts now
    'https://raw.githubusercontent.com/BornaIz/google-fonts-regular/master/Cairo-Regular.ttf'
  ];
  for (const url of cairoUrls) {
    try {
      const res = await fetch(url);
      console.log(url, res.ok, res.status);
    } catch (e) {
      console.error(url, 'Error!');
    }
  }
}
testFonts2();
