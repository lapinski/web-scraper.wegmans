const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const actions = require('./actions');
const config = require('./config');


const main = async () => {

    const browser = await puppeteer.launch({headless:config.headless});
    const page = await browser.newPage();
    await page.setViewport({width: config.viewport.width, height: config.viewport.height});

    await actions.signIn(page);

    const screenshotDir = path.resolve(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }

    await page.screenshot({path: path.resolve(screenshotDir, 'signin.png')});

    await page.goto(`${config.baseUrl}/my-receipts.html`);

    await page.screenshot({path: path.resolve(screenshotDir, 'receipts.png')});

    await browser.close();
};

try {
    main();
} catch(e) {
    console.error(e);
    process.exit(1);
}
