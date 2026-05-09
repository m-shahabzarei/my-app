const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'state.json'
  });

  const page = await context.newPage();
  await page.goto('https://web.eitaa.com');

  await page.waitForTimeout(5000);

  const messages = await page.evaluate(() => {
    const result = [];

    const items = document.querySelectorAll('div');

    items.forEach((el) => {
      const text = el.innerText?.trim();
      if (!text) return;

      if (text.split('\n').length >= 3 && text.length < 500) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        if (lines.length >= 2) {
          const sender = lines[0];

          let messageText = lines[lines.length - 1];

          if (/^\d+$/.test(messageText)) {
            messageText = lines[lines.length - 2] || messageText;
          }

          result.push({
            id: sender + '-' + messageText,
            sender,
            text: messageText,
            createdAt: Date.now()
          });
        }
      }
    });

    return result.slice(-10);
  });

  // 🔥 این قسمت مهمه
  await fetch('http://localhost:3000/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  });

  console.log('ارسال شد ✅');

  await browser.close();
})();