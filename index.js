const puppeteer = require('puppeteer');
const actions = require('./actions');
const config = require('./resources/config');
const models = require('./resources/models');

const log = console.log;

const main = async () => {

    const browser = await puppeteer.launch({headless:config.headless});
    const page = await browser.newPage();
    await page.setViewport({width: config.viewport.width, height: config.viewport.height});

    log('Signing In');
    await actions.signIn(page);

    log('Navigating to Receipts Page');
    const receipts = await actions.getReceiptList(page);

    // TODO: Save each row to database, instead of printing them here
    console.log(JSON.stringify(receipts));
    try {
        for(let i = 0, len = receipts.length; i < len; i++) {
            const receipt = receipts[i];
            await models.Receipt.create({
                date: receipt.dateTime,
                amount: receipt.value,
                url: receipt.url,
                store: 'Wegmans',
            });
        }
    } catch (e) {
        console.log(e);
    }

    models.Receipt.save();


    await page.waitFor(240 * 1000);

    await browser.close();
};

try {
    main();
} catch(e) {
    console.error(e);
    process.exit(1);
}
