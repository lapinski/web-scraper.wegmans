import * as _ from 'lodash';
import moment, { Moment } from 'moment';
import url from 'url';
import logger from '../resources/logger';
import * as screenshots from '../resources/screenshots';
import config from '../resources/config';
import { Page } from 'puppeteer';
import { Receipt } from '../types/receipt';
import { PageObjectModel } from '../types/content-types';

const myReceiptsPage: PageObjectModel = {
  path: '/my-receipts.html',
};


const removeNewline = (input:string) => _.replace(input, /\r?\n|\r/g, '');
const maybe = (test: (input:string) => string|null, value:string) => (test(value) ? value : null);
const parseDate = _.partial(moment, _, 'MMM. DD, YYYY hh:mma');

const sanitizeDate:(input:string) => Moment = _.flow(
  _.partial(maybe, _.isString),
  removeNewline,
  parseDate,
);
const sanitizeNumber:(input:string) => number = _.flow(
  _.partial(maybe, _.isString),
  removeNewline,
  _.toNumber,
);

/**
 *
 * @param page
 * @returns {Promise<Array>}
 */
export default async function getReceiptList(page: Page):Promise<ReadonlyArray<Receipt>> {
  await page.goto(`${config.baseUrl}${myReceiptsPage.path}`);
  await screenshots.save(page, 'receipts');

  // Get table of receipt totals / date
  const rawReceipts = await page.$$eval('.recall-table-set', rowParts =>

    Array.from(rowParts).map(row => {
      const dateElem = row.querySelector('.date-time');
      const amountElem = row.querySelector('.sold-col');
      const urlElem = row.querySelector('.view-col a');

      return {
        date: dateElem ? dateElem.textContent.toString() : null,
        amount: amountElem ? amountElem.textContent.toString() : null,
        url: urlElem ? urlElem.getAttribute('href') : null,
      };
    }),
  );

  const parsedReceipts = _.map(rawReceipts, rawReceipt => {
    let dateValue = null;
    let amountValue = null;
    let urlValue = null;

    try {
      const parsedDateValue = sanitizeDate(rawReceipt.date);
      if (parsedDateValue.isValid()) {
        dateValue = parsedDateValue;
      }
    } catch (e) {
      logger.error(`Error parsing date: ${rawReceipt.date}`, { rawReceipt });
    }

    try {
      const parsedAmountValue = sanitizeNumber(rawReceipt.amount);
      if (!_.isNaN(parsedAmountValue)) {
        amountValue = parsedAmountValue;
      }
    } catch (e) {
      logger.error(`Error parsing dollar amount: ${rawReceipt.amount}`);
    }

    try {
      if (_.isString(rawReceipt.url) && !_.isNull(rawReceipt.url)) {
        urlValue = url.parse(rawReceipt.url);
      }
    } catch (e) {
      logger.error(`Error parsing url: ${rawReceipt.url}`);
    }

    return <Receipt>{
      dateTime: dateValue,
      value: amountValue,
      url: urlValue,
    };
  });

  const isReceiptNull = (input:Receipt):boolean => _.isNull(input.dateTime) && _.isNull(input.url);

  return _.reject(parsedReceipts, isReceiptNull);
};
