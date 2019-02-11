import { Page } from 'puppeteer';
import * as screenshots from '../resources/screenshots';
import { getScreenshotsConfig, WegmansConfig } from '../resources/config';
import { prop, map } from 'ramda';
import { extractTextContent, sanitizeDate, sanitizeNumber } from './element-helpers';
import url, { URL } from 'url';
import { Maybe, Nothing } from 'purify-ts/adts/Maybe';


const extractAnchorUrl = (el: any): Maybe<URL> => Nothing;

const _receiptTableSelector = '.recall-table-set';
const _dateFieldSelector = '.date-time';
const _amountFieldSelector = '.sold-col';
const _productUrlSelector = '.view-col a';

export const extractReceiptSummary = (row: Element): {date: string, amount: string, url: URL} => {
    const dateElem = row.querySelector(_dateFieldSelector);
    const amountElem = row.querySelector(_amountFieldSelector);
    const urlElem = row.querySelector(_productUrlSelector);

    return {
        date: extractTextContent(dateElem).orDefault(undefined),
        amount: extractTextContent(amountElem).orDefault(undefined),
        url: extractAnchorUrl(urlElem).orDefault(undefined),
    };
};

export const parseReceiptSummary = (input: { date: string, amount: string, url: URL}) =>
    ({
        dateTime: sanitizeDate(input.date),
        value: sanitizeNumber(input.amount),
        url: Maybe.fromNullable(url),
    });

export const constructPageUrl = (config: WegmansConfig) => {
    const basePath = prop('path.baseUrl', config);
    const pagePath = prop('path.myReceiptsPage', config);
    return `${basePath}${pagePath}`;
};

/**
 *
 * @param page
 * @returns {Promise<Array>}
 */
export default async function getReceiptList(config: WegmansConfig, page: Page) {
  await page.goto(constructPageUrl(config));
  await screenshots.save(getScreenshotsConfig(), page, 'receipts');

  const receiptSummaries = await page
      .$$eval(_receiptTableSelector,
          (rowParts: Element[]) => Array.from(rowParts)
              .map(extractReceiptSummary),
      );

  return map(parseReceiptSummary, receiptSummaries);
}
