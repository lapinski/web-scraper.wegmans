import { Page } from 'puppeteer';
import { Url } from 'url';
import { prop, pipe } from 'ramda';
import { Just, Nothing } from 'purify-ts/adts/Maybe';
import { getScreenshotsConfig } from '../resources/config';

const screenshots = require('../resources/screenshots');

export const parseElementText = (element: Element) =>
    element
        ? Just((prop('textContent', element).toString()))
        : Nothing;

export const parseElementTextAsFloat = pipe(
    parseElementText,
    (text) => text.isJust()
        ? Just(parseFloat(text.extract()))
        : Nothing
);

export const parseElementAttribute = (attrName: string, element: Element) =>
    element && element.hasAttribute(attrName)
        ? Just(element.getAttribute(attrName))
        : Nothing;

export default async function getReceiptTransactions(page: Page, url: Url) {
  await page.goto(url.toString());
  await screenshots.save(getScreenshotsConfig(), page, `receipts-${url.query}`);

  // Get table of transactions totals / date
  return await page.$$eval('.recall-table-set', rowParts =>
    Array.from(rowParts).map(row => {
    const quantityElem = row.querySelector('.date-time');
    const productElem = row.querySelector('.product-col a');
    const productCodeElem = row.querySelector('.product-col.ordernum');
    const amountElem = row.querySelector('.price-view');
    const discountElem = row.querySelector(
        '.myreceipt-savings-row .save-price',
    );

    return {
        quantity: parseElementText(quantityElem),
        productName: parseElementText(productElem),
        productUrl: parseElementAttribute('href', productElem),
        productCode: parseElementText(productCodeElem),
        amount: parseElementTextAsFloat(amountElem),
        discount: parseElementText(discountElem),
    };
    }),
  );
}
