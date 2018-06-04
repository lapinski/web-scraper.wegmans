const _ = require('lodash');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Promise = require('bluebird');
const actions = require('./actions');
const config = require('./config');

const log = console.log;

const main = async () => {

    const browser = await puppeteer.launch({headless:config.headless});
    const page = await browser.newPage();
    await page.setViewport({width: config.viewport.width, height: config.viewport.height});

    log('Signing In');
    await actions.signIn(page);

    const screenshotDir = path.resolve(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }

    await page.screenshot({path: path.resolve(screenshotDir, 'signin.png')});

    log('Navigating to Receipts Page');
    await page.goto(`${config.baseUrl}/my-receipts.html`);

    await page.screenshot({path: path.resolve(screenshotDir, 'receipts.png')});


    // Get table of receipt totals / date
    const receipts = await page.$$eval('.recall-table-set', (rowParts) =>
        Array.from(rowParts).map(row => {
            const dateElem = row.querySelector('.date-time');
            const valueElem = row.querySelector('.sold-col');
            const urlElem = row.querySelector('.view-col a');

            return {
                dateTime: dateElem ? dateElem.innerText : null,
                value: valueElem ? valueElem.innerText: null,
                url: urlElem ? urlElem.href : null,
            };
        })
    );

    console.log(JSON.stringify(receipts));

    await page.waitFor(240 * 1000);

    await browser.close();
};

try {
    main();
} catch(e) {
    console.error(e);
    process.exit(1);
}
