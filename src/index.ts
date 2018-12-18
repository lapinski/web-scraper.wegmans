import actions from './actions';
import { container } from './container.config';
import { RawTransaction } from './types';
import { IBrowser, IBrowserType } from './resources/browser';
import { ILogger, ILoggerType } from './resources/logger';

const main = async () => {
  const logger = container.get<ILogger>(ILoggerType);
  const browser = container.get<IBrowser>(IBrowserType);
  const page = await browser.getPage();

  logger.info('Signing In');
  await actions.signIn(page);

  logger.info('Navigating to Receipts Page');
  const receipts = await actions.getReceipts(page);

  logger.info('Saving Receipts to Database');
  const savedReceipts = await actions.saveReceiptsToDb(receipts, 'Wegmans');

  // TODO: Get all transactions for all receipts

  const queue = [];

  for (let i = 0, len = savedReceipts.length; i < len; i += 1) {
    const savedReceipt = savedReceipts[i];
    logger.info('Queueing Fetching Receipt Transaction');
    queue.push(
      actions
        .getTransactions(page, new URL(savedReceipt.url))
        .then((transactions:Array<RawTransaction>) =>
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
