const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

const scraperPath = path.join(__dirname, '../scraper.js');

cron.schedule('*/3 * * * *', () => {
  console.log('🟡 Running scraper every 3 minutes...');

  exec(`node "${scraperPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Scraper error:', error.message);
      return;
    }

    if (stderr) {
      console.error('⚠️ stderr:', stderr);
      return;
    }

    console.log('✅ Scraper output:\n', stdout);
  });
});

console.log('🚀 Cron scheduler started (every 3 minutes)');