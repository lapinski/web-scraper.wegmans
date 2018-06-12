const fs = require('fs');
const path = require('path');
const config = require('./config');

module.exports = {
  save: async function(page, name) {
    if (!config.screenshots.save) {
      return;
    }

    const screenshotDir = path.resolve(process.cwd(), config.screenshots.dir);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }

    await page.screenshot({ path: path.resolve(screenshotDir, `${name}.png`) });
  },
};
