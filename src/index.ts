import puppeteer from 'puppeteer';
import * as logger from './resources/logger';
import { log, LogLevel } from './resources/logger';
import actions from './actions';
import { RawTransaction } from './types/receipt';
import config, { getScreenshotsConfig, getWegmansConfig } from './resources/config';
import signInPage from './page-objects/sign-in.page';

// Setup Logging
const logConfig = config.get('logging');
logger.addTransport(logger.getFileTransport(logConfig.filename, logConfig.level));
if (logConfig.console) {
    logger.addTransport(logger.getConsoleTransport(LogLevel.Info));
}

const main = async () => {
  const browser = await puppeteer.launch({ headless: config.get('puppeteer.headless') });
  const page = await browser.newPage();
  await page.setViewport({
    width: config.get('puppeteer.viewport.width'),
    height: config.get('puppeteer.viewport.height'),
  });

  logger.log(LogLevel.Info, 'Signing In');
  await actions.signIn(page, signInPage, getWegmansConfig(), getScreenshotsConfig());

  logger.log(LogLevel.Info, 'Navigating to Receipts Page');
  const receipts = await actions.getReceiptList(page);

    logger.log(LogLevel.Info, 'Saving Receipts to Database');
  const savedReceipts = await actions.saveReceiptsToDb(receipts, 'Wegmans');

  // TODO: Get all transactions for all receipts

  const queue = [];

  for (let i = 0, len = savedReceipts.length; i < len; i += 1) {
    const savedReceipt = savedReceipts[i];
      logger.log(LogLevel.Info, 'Queueing Fetching Receipt Transaction');
    queue.push(
      actions
        .getReceiptTransactions(page, new URL(savedReceipt.url))
        .then((transactions: Array<RawTransaction>) =>
          actions.saveTransactionsToDb(transactions, savedReceipt),
        ),
    );
  }

    logger.log(LogLevel.Info, 'Waiting for queue to complete');
  try {
    await Promise.all(queue);
  } catch (error) {
      logger.log(LogLevel.Error, 'An error occurred waiting for all queued tasks', { error });
  }

    logger.log(LogLevel.Info, 'closing browser');
  await browser.close();
};

try {
  main();
} catch (e) {
  logger.log(LogLevel.Error, 'A top-level error occurred', { error: e });
  process.exit(1);
}
