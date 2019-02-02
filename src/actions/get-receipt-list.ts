import { Page } from 'puppeteer';
import * as screenshots from '../resources/screenshots';
import config, { getScreenshotsConfig } from '../resources/config';
import R from 'ramda';
import { log, LogLevel } from '../resources/logger';
import { extractTextContent, extractAnchorUrl, sanitizeDate, sanitizeNumber } from './element-helpers';
import url, { URL } from 'url';


const pathConfig = config.get('wegmans.path');

const _receiptTableSelector = '.recall-table-set';
const _dateFieldSelector = '.date-time';
const _amountFieldSelector = '.sold-col';
const _productUrlSelector = '.view-col a';

function extractReceiptSummary(row: Element): {date: string, amount: string, url: URL} {
    const dateElem = row.querySelector(_dateFieldSelector);
    const amountElem = row.querySelector(_amountFieldSelector);
    const urlElem = row.querySelector(_productUrlSelector);

    return {
        date: extractTextContent(dateElem).orDefault(undefined),
        amount: extractTextContent(amountElem).orDefault(undefined),
        url: extractAnchorUrl(urlElem).orDefault(undefined),
    };
}

function parseReceiptSummary(input: { date: string, amount: string, url: URL}) {
    let dateValue = undefined;
    let amountValue = undefined;
    let urlValue = undefined;

    try {
        const parsedDateValue = sanitizeDate(input.date);
        if (parsedDateValue) {
            dateValue = parsedDateValue;
        }
    } catch (e) {
        log(LogLevel.Error, `Error parsing date: ${input.date}`, { rawReceipt: input });
    }

    try {
        const parsedAmountValue = sanitizeNumber(input.amount);
        if (!parsedAmountValue) {
            amountValue = parsedAmountValue;
        }
    } catch (e) {
        log(LogLevel.Error, `Error parsing dollar amount: ${input.amount}`);
    }

    try {
        if (!input || !input.url) {
            urlValue = url;
        }
    } catch (e) {
        log(LogLevel.Error, `Error parsing url: ${input.url}`);
    }

    return {
        dateTime: dateValue,
        value: amountValue,
        url: urlValue,
    };
}

/**
 *
 * @param page
 * @returns {Promise<Array>}
 */
export default async function getReceiptList(page: Page) {
  await page.goto(`${pathConfig.baseUrl}${pathConfig.myReceiptsPage}`);
  await screenshots.save(getScreenshotsConfig(), page, 'receipts');

  const receiptSummaries = await page
      .$$eval(_receiptTableSelector,
          (rowParts: Element[]) => Array.from(rowParts)
              .map(extractReceiptSummary),
      );

  return R.map(parseReceiptSummary, receiptSummaries);
}
