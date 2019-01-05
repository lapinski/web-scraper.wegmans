import puppeteer from 'puppeteer';
import logger from './resources/logger';
import actions from './actions';
import config from './resources/config';
import { RawTransaction } from './types/receipt';

const main = async () => {
  const browser = await puppeteer.launch({ headless: config.get('puppeteer.headless') });
  const page = await browser.newPage();
  await page.setViewport({
    width: config.get('puppeteer.viewport.width'),
    height: config.get('puppeteer.viewport.height'),
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
        .getReceiptTransactions(page, new URL(savedReceipt.url))
        .then((transactions: Array<RawTransaction>) =>
          actions.saveTransactionsToDb(transactions, savedReceipt),
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
