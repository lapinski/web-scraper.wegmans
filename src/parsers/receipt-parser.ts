import logger from '../resources/logger';
import * as _ from 'lodash';
import url, { UrlWithStringQuery } from 'url';
import { Moment } from 'moment';
import moment from 'moment';

export const removeNewline = (input: string) =>
  _.replace(input, /\r?\n|\r/g, '');

export const maybe = (test: (input: string) => string|undefined, value: string) =>
  (test(value) ? value : undefined);

export const parseDate = _.partial(moment, _, 'MMM. DD, YYYY hh:mma');


export const sanitizeDate: (input: string) => Moment = _.flow(
  _.partial(maybe, _.isString),
  removeNewline,
  parseDate,
);
export const sanitizeNumber: (input: string) => number = _.flow(
  _.partial(maybe, _.isString),
  removeNewline,
  _.toNumber,
);

export const isReceiptNull = (input: ReceiptParserOutput): boolean =>
  _.isNull(input.dateTime) && _.isNull(input.url);

export interface ReceiptParserInput {
  date: string;
  amount: string;
  url: string;
}

export interface ReceiptParserOutput {
  readonly dateTime: Moment;
  readonly value: number;
  readonly url: UrlWithStringQuery;
}

export function parseOne(rawReceipt:ReceiptParserInput):ReceiptParserOutput {
  let dateValue = undefined;
  let amountValue = undefined;
  let urlValue = undefined;

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
}

export function parseMany(input:ReadonlyArray<ReceiptParserInput>):ReadonlyArray<ReceiptParserOutput> {
  const output = _.map(input, parseOne);
  return _.reject(output, isReceiptNull);
};
