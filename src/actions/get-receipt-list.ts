import { Page } from 'puppeteer';
import * as screenshots from '../resources/screenshots';
import config from '../resources/config';
import { parseMany, ReceiptParserOutput } from '../parsers/receipt-parser';
import { MyReceiptsPage } from '../pages/my-receipts-page';

const pathConfig = config.get('wegmans.path');

/**
 *
 * @param page
 * @returns {Promise<Array>}
 */
export default async function getReceiptList(page: Page): Promise<ReadonlyArray<ReceiptParserOutput>> {
  await page.goto(`${pathConfig.baseUrl}${pathConfig.myReceiptsPage}`);
  await screenshots.save(page, 'receipts');

  const pageModel = new MyReceiptsPage(page);

  const rawReceipts = await pageModel.getReceipts();

  return parseMany(rawReceipts);
}
