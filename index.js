const puppeteer = require('puppeteer');
const actions = require('./actions');
const config = require('./resources/config');

const log = console.log;

const main = async () => {
  const browser = await puppeteer.launch({ headless: config.headless });
  const page = await browser.newPage();
  await page.setViewport({
    width: config.viewport.width,
    height: config.viewport.height,
  });

  log('Signing In');
  await actions.signIn(page);

  log('Navigating to Receipts Page');
  const receipts = await actions.getReceiptList(page);

  log('Saving Receipts to Database');
  const savedReceipts = await actions.saveReceiptsToDb(receipts, 'Wegmans');

  // TODO: Get all transactions for all receipts
  for (let savedReceipt of savedReceipts) {
    log('Fetching Receipt Transaction');
    const transactions = await actions.getReceiptTransactions(
      page,
      savedReceipt.url,
    );
    console.log(JSON.stringify(transactions));

    log('Saving Transactions to Database');
    await actions.saveTransactionsToDb(transactions, savedReceipt.id);
  }

  log('Waiting for debug');
  await page.waitFor(240 * 1000);

  await browser.close();
};

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
