async function testFonts() {
  const cairoUrls = [
    'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo-Regular.ttf',
    'https://raw.githubusercontent.com/googlefonts/cairo/main/fonts/ttf/Cairo-Regular.ttf',
    'https://fonts.gstatic.com/s/cairo/v28/SL3cWWR8o5n0i572UWDY.ttf'
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
testFonts();
