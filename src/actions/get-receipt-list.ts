import { Page } from 'puppeteer';
import * as screenshots from '../resources/screenshots';
import config from '../resources/config';
import { ReceiptParserOutput } from '../parsers/receipt-parser';
import { PageObjectModel } from '../types/content-types';

const myReceiptsPage: PageObjectModel = {
  path: '/my-receipts.html',
};

/**
 *
 * @param page
 * @returns {Promise<Array>}
 */
export default async function getReceiptList(page: Page): Promise<ReadonlyArray<ReceiptParserOutput>> {
  await page.goto(`${config.get('wegmans').baseUrl}${myReceiptsPage.path}`);
  await screenshots.save(page, 'receipts');

  // Get table of receipt totals / date
  const rawReceipts = await page.$$eval('.recall-table-set', rowParts =>

    Array.from(rowParts).map(row => {
      const dateElem = row.querySelector('.date-time');
      const amountElem = row.querySelector('.sold-col');
      const urlElem = row.querySelector('.view-col a');

      return {
        date: dateElem ? dateElem.textContent.toString() : undefined,
        amount: amountElem ? amountElem.textContent.toString() : undefined,
        url: urlElem ? urlElem.getAttribute('href') : undefined,
      };
    }),
  );

  return receiptParser.parseMany(rawReceipts);
}
