import puppeteer from 'puppeteer';
import logger from './resources/logger';
import actions from './actions';
import config from './resources/config';

const main = async () => {
  const browser = await puppeteer.launch({ headless: config.headless });
  const page = await browser.newPage();
  await page.setViewport({
    width: config.viewport.width,
    height: config.viewport.height,
  });

  logger.info('Signing In');
  await actions.signIn(page);

  logger.info('Navigating to Receipts Page');
  const receipts = await actions.getReceiptList(page);

  logger.info('Saving Receipts to Database');
  const savedReceipts = await actions.saveReceiptsToDb(receipts, 'Wegmans');

  // TODO: Get all transactions for all receipts

  const queue = [];

  for (let i = 0, len = savedReceipts.length; i < len; i += 1) {
    const savedReceipt = savedReceipts[i];
    logger.info('Queueing Fetching Receipt Transaction');
    queue.push(
      actions
        .getReceiptTransactions(page, savedReceipt.url)
        .then(transactions =>
          actions.saveTransactionsToDb(transactions, savedReceipt.id),
        ),
    );
  }

  logger.info('Waiting for queue to complete');
  try {
    await Promise.all(queue);
  } catch (error) {
    logger.error('An error occurred waiting for all queued tasks', { error });
  }

  logger.info('closing browser');
  await browser.close();
};

try {
  main();
} catch (e) {
  logger.error('A top-level error occurred', { error: e });
  process.exit(1);
}
