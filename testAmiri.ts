async function testAmiri() {
  const amiriUrls = [
    'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf',
    'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Bold.ttf',
  ];
  for (const url of amiriUrls) {
    try {
      const res = await fetch(url);
      console.log(url, res.ok, res.status);
    } catch (e) {
      console.error(url, 'Error!');
    }
  }
}
testAmiri();
