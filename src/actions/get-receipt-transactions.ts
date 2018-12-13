import { Transaction } from '../types/receipt';
import { Page } from 'puppeteer';
import { Url } from 'url';

const screenshots = require('../resources/screenshots');

export default async function getReceiptTransactions(page: Page, url: Url):Promise<ReadonlyArray<Transaction>> {
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

      return <Transaction>{
        quantity: quantityElem ? quantityElem.textContent.toString() : null,
        productName: productElem ? productElem.textContent.toString() : null,
        productUrl: productElem ? productElem.getAttribute('href') : null,
        productCode: productCodeElem ? productCodeElem.textContent.toString() : null,
        amount: amountElem ? parseFloat(amountElem.textContent.toString()) : null,
        discount: discountElem ? discountElem.textContent.toString() : null,
      };
    }),
  );

  // TODO: Parse Transactions
  return rawTransactions;
};
