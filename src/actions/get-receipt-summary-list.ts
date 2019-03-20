import cheerio from 'cheerio';
import { Moment } from 'moment';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import R from 'ramda';
import { Page } from 'puppeteer';
import url from 'url';
import {
    extractDate,
    extractFloat,
    extractHref,
    extractText,
} from './element-helpers';
import { navigateToUrlAndWait } from './browser-helpers';
import {
    MyReceiptsPageObjectModel,
    ReceiptSummaryRowSelectors,
} from '../page-objects/my-receipts.page';

/**
 * A cleaned up Receipt Summary.
 * Each property of this interface is a Maybe type, indicating there might be
 * a value, or it may not have been able to be parsed from the raw HTML.
 */
export interface SanitizedReceiptSummary {
    date: Maybe<Moment>;
    postalAddress: {
        street: Maybe<string>,
        town: Maybe<string>,
    };
    amount: Maybe<number>;
    url: Maybe<string>;
}

/**
 * A fully cleaned Receipt Summary.
 *
 * Each property has a valid value, no property is null or undefined.
 */
export interface ReceiptSummary {
    date: Moment;
    postalAddress: {
        street: string,
        town: string,
    };
    amount: number;
    url: string;
}

const isValidReceiptSummary = (input: SanitizedReceiptSummary): boolean =>
    input ?
        input.date.isJust() &&
        input.postalAddress.street.isJust() &&
        input.postalAddress.town.isJust() &&
        input.amount.isJust() &&
        input.url.isJust()
        : false;

const extractReceiptSummaryFromRow = R.curry((
    pom: ReceiptSummaryRowSelectors,
    row: Cheerio): SanitizedReceiptSummary =>
    ({
        amount: extractFloat(pom.amount, row),
        date: extractDate(pom.date, row),
        postalAddress: {
            street: extractText(pom.postalAddress.street, row),
            town: extractText(pom.postalAddress.town, row),
        },
        url: extractHref(pom.url, row),
    })
);

const extractOrDefault = <T>(aMaybe: Maybe<T>, aDefaultValue: T) =>
    aMaybe
        ? aMaybe.orDefault(aDefaultValue)
        : aDefaultValue;


const extractReceiptSummaryFromMaybe = (input: SanitizedReceiptSummary): ReceiptSummary =>
    ({
        date: extractOrDefault(R.prop('date', input), undefined),
        postalAddress: R.prop('postalAddress')
            ? {
                street: extractOrDefault(R.path(['postalAddress', 'street'], input), undefined),
                town: extractOrDefault(R.path(['postalAddress', 'town'], input), undefined),
            }
            : {
                street: undefined,
                town: undefined,
            },
        amount: extractOrDefault(R.prop('amount', input), undefined),
        url: extractOrDefault(R.prop('url', input), undefined),
    });

const parseRows = (pom: ReceiptSummaryRowSelectors, input: Cheerio): Maybe<ReceiptSummary[]> => R.pipe(

    // Convert to a CheerioElement array
    (rawRows: Cheerio) => rawRows ? Just(R.map(a => cheerio(a), rawRows.toArray())) : Nothing,

    // Extract the text from HTML Elements
    rows => rows.isJust() ? Just(R.map(extractReceiptSummaryFromRow(pom), rows.extract())) : Nothing,

    // Only get records that don't have 'Nothings' for values
    rows => rows.isJust() ? Just(R.filter(isValidReceiptSummary, rows.extract())) : Nothing,

    // Extract the 'Maybe' values from each record
    rows => rows.isJust() ? Just(R.map(extractReceiptSummaryFromMaybe, rows.extract())) : Nothing,
)(input);

const parseMyReceiptsPage = R.curry(
    (pom: MyReceiptsPageObjectModel, page: Page): Promise<{page: Page, receiptSummaries: Maybe<ReceiptSummary[]>}> =>
        page.content()
            .then(cheerio.load)
            .then($ => $(pom.receiptSummaryRows))
            .then(rows => ({page, receiptSummaries: parseRows(pom.receiptSummary, rows)})),
);

const getAbsoluteUrl = (baseUrl: string, pom: MyReceiptsPageObjectModel) => url.resolve(baseUrl, pom.path);

const getReceiptSummaryList = R.curry(
    (baseUrl: string, pom: MyReceiptsPageObjectModel, page: Page): Promise<{page: Page, receiptSummaries: Maybe<ReceiptSummary[]>}> =>
        navigateToUrlAndWait(getAbsoluteUrl(baseUrl, pom), page)
            .then(p => p)
            .then(page => parseMyReceiptsPage(pom, page)),
);

export {
    extractReceiptSummaryFromMaybe,
    extractReceiptSummaryFromRow,
    getReceiptSummaryList,
    isValidReceiptSummary,
    parseMyReceiptsPage,
    parseRows,
};

export default getReceiptSummaryList;