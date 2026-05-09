const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  const page = await context.newPage();
  await page.goto('https://web.eitaa.com');

  console.log('لاگین کن، بعد Enter بزن...');
  process.stdin.once('data', async () => {
    await context.storageState({ path: 'state.json' });
    await browser.close();
  });
})();