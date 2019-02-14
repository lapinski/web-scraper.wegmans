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
    row: CheerioElement): SanitizedReceiptSummary => ({
    amount: extractFloat(pom.amount, row),
    date: extractDate(pom.date, row),
    postalAddress: {
        street: extractText(
            pom.postalAddress.street,
            row
        ),
        town: extractText(
            pom.postalAddress.town,
            row
        ),
    },
    url: extractHref(pom.url, row),
}));

const extractReceiptSummaryFromMaybe = (input: SanitizedReceiptSummary): ReceiptSummary =>
    ({
        date: R.prop('date', input).extract(),
        postalAddress: {
            street: input.postalAddress.street.extract(),
            town: input.postalAddress.town.extract(),
        },
        amount: R.prop('amount', input).extract(),
        url: R.prop('url', input).extract(),
    });

const parseRows = (pom: ReceiptSummaryRowSelectors, input: Cheerio) => R.pipe(
    (input: Cheerio) => input ? Just(input.toArray()) : Nothing,
    rows => rows.isJust() ? Just(R.map(extractReceiptSummaryFromRow(pom), rows.extract())) : Nothing,
    rows => rows.isJust() ? Just(R.filter(isValidReceiptSummary, rows.extract())) : Nothing,
    rows => rows.isJust() ? Just(R.map(extractReceiptSummaryFromMaybe, rows.extract())) : Nothing,
)(input);

const parseMyReceiptsPage = R.curry(
    (pom: MyReceiptsPageObjectModel, page: Page) =>
        page.content()
            .then(cheerio.load)
            .then($ => $(pom.receiptSummaryRows))
            .then(rows => [page, parseRows(pom.receiptSummary, rows)])
);

const getReceiptSummaryList = R.curryN(
    3,
    (baseUrl: string, pom: MyReceiptsPageObjectModel, page: Page) =>
        navigateToUrlAndWait(url.resolve(baseUrl, pom.path), page)
            .then(parseMyReceiptsPage(pom))
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