const _ = require('lodash');
const moment = require('moment');
const url = require('url');
const logger = require('../resources/logger');
const screenshots = require('../resources/screenshots');
const config = require('../resources/config');

const removeNewline = input => _.replace(input, /\r?\n|\r/g, '');
const maybe = (test, value) => (test(value) ? value : null);
const parseDate = _.partial(moment, _, 'MMM. DD, YYYY hh:mma');

const sanitizeDate = _.flow(
  _.partial(maybe, _.isString),
  removeNewline,
  parseDate,
);
const sanitizeNumber = _.flow(
  _.partial(maybe, _.isString),
  removeNewline,
  _.toNumber,
);

/**
 *
 * @param page
 * @returns {Promise<Array>}
 */
module.exports = async function getReceiptList(page) {
  await page.goto(`${config.baseUrl}/my-receipts.html`);
  await screenshots.save(page, 'receipts');

  // Get table of receipt totals / date
  const rawReceipts = await page.$$eval('.recall-table-set', rowParts =>
    Array.from(rowParts).map(row => {
      const dateElem = row.querySelector('.date-time');
      const amountElem = row.querySelector('.sold-col');
      const urlElem = row.querySelector('.view-col a');

      return {
        date: dateElem ? dateElem.innerText : null,
        amount: amountElem ? amountElem.innerText : null,
        url: urlElem ? urlElem.href : null,
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

    return {
      dateTime: dateValue,
      value: amountValue,
      url: urlValue,
    };
  });

  const isReceiptNull = input =>
    _.isNull(input.dateTime) && _.isNull(input.url);

  return _.reject(parsedReceipts, isReceiptNull);
};
