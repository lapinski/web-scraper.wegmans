import { Page } from 'puppeteer';
import * as screenshots from '../resources/screenshots';
import config from '../resources/config';
import * as _ from 'lodash';
import logger from '../resources/logger';
import url, { Url } from 'url';
import { sanitizeDate, sanitizeNumber } from './element-helpers';
import { Moment } from 'moment';


const pathConfig = config.get('wegmans.path');

const _receiptTableSelector = '.recall-table-set';
const _dateFieldSelector = '.date-time';
const _amountFieldSelector = '.sold-col';
const _productUrlSelector = '.view-col a';

function extractReceiptSummary(row: Element) {
    const dateElem = row.querySelector(_dateFieldSelector);
    const amountElem = row.querySelector(_amountFieldSelector);
    const urlElem = row.querySelector(_productUrlSelector);

    return {
        date: this.extractTextContent(dateElem),
        amount: this.extractTextContent(amountElem),
        url: this.extractAnchorUrl(urlElem),
    };
}

function parseReceiptSummary(input: { date: string, amount: string, url: string}) {
    let dateValue = undefined;
    let amountValue = undefined;
    let urlValue = undefined;

    try {
        const parsedDateValue = sanitizeDate(input.date);
        if (parsedDateValue.isValid()) {
            dateValue = parsedDateValue;
        }
    } catch (e) {
        logger.error(`Error parsing date: ${input.date}`, { rawReceipt: input });
    }

    try {
        const parsedAmountValue = sanitizeNumber(input.amount);
        if (!_.isNaN(parsedAmountValue)) {
            amountValue = parsedAmountValue;
        }
    } catch (e) {
        logger.error(`Error parsing dollar amount: ${input.amount}`);
    }

    try {
        if (_.isString(input.url) && !_.isNull(input.url)) {
            urlValue = url.parse(input.url);
        }
    } catch (e) {
        logger.error(`Error parsing url: ${input.url}`);
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
export default async function getReceiptList(page: Page): Promise<ReadonlyArray<{dateTime: Moment, value: number, url: Url}>> {
  await page.goto(`${pathConfig.baseUrl}${pathConfig.myReceiptsPage}`);
  await screenshots.save(page, 'receipts');

  const receiptSummaries = await page
      .$$eval(_receiptTableSelector,
          (rowParts:Element[]) => Array.from(rowParts)
              .map(this.extractReceiptSummary),
      );

  return _.map(receiptSummaries, parseReceiptSummary);
}
