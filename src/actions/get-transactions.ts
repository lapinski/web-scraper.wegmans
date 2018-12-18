import { RawTransaction } from '../types';
import { Page } from 'puppeteer';
import { Url } from 'url';

const screenshots = require('../resources/screenshots');

export default async function getTransactions(page: Page, url: Url):Promise<ReadonlyArray<RawTransaction>> {
  await page.goto(url.toString());
  await screenshots.save(page, `receipts-${url.query}`);

  // Get table of transactions totals / date
  const rawTransactions = await page.$$eval('.recall-table-set', rowParts =>
    Array.from(rowParts).map(row => {
      const quantityElem = row.querySelector('.date-time');
      const productElem = row.querySelector('.product-col a');
      const productCodeElem = row.querySelector('.product-col.ordernum');
      const amountElem = row.querySelector('.price-view');
      const discountElem = row.querySelector(
        '.myreceipt-savings-row .save-price',
      );

      return <RawTransaction>{
        quantity: quantityElem ? quantityElem.textContent.toString() : undefined,
        productName: productElem ? productElem.textContent.toString() : undefined,
        productUrl: productElem ? productElem.getAttribute('href') : undefined,
        productCode: productCodeElem ? productCodeElem.textContent.toString() : undefined,
        amount: amountElem ? parseFloat(amountElem.textContent.toString()) : undefined,
        discount: discountElem ? discountElem.textContent.toString() : undefined,
      };
    }),
  );

  // TODO: Parse Transactions
  return rawTransactions;
}
