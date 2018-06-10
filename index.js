const puppeteer = require('puppeteer');
const actions = require('./actions');
const config = require('./resources/config');

const log = console.log;

const main = async () => {

    const browser = await puppeteer.launch({headless:config.headless});
    const page = await browser.newPage();
    await page.setViewport({width: config.viewport.width, height: config.viewport.height});

    log('Signing In');
    await actions.signIn(page);

    log('Navigating to Receipts Page');
    const receipts = await actions.getReceiptList(page);

    console.log(JSON.stringify(receipts));

    log('Saving Receipts to Database');
    await actions.saveReceiptsToDb(receipts, 'Wegmans');

    await page.waitFor(240 * 1000);

    await browser.close();
};

try {
    main();
} catch(e) {
    console.error(e);
    process.exit(1);
}
