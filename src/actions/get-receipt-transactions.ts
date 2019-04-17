import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import { Page } from 'puppeteer';
import R from 'ramda';
import * as url from 'url';
import { Moment } from 'moment';

import { extractDate, extractFloat, extractText } from './element-helpers';
import { ReceiptSummary } from './get-receipt-summary-list';
import { navigateToUrlAndWait } from './browser-helpers';
import { ReceiptDetailPageObjectModel } from '../page-objects/receipt-detail.page';
import { ActionResponse } from './types';
import pMapSeries from 'p-map-series';



export interface Transaction {

}

export interface RawReceipt {
    date: Maybe<Moment>;
    receiptInfo: {
        place: Maybe<string>;
        lane: Maybe<string>;
        operator: Maybe<string>;
    };
    transactions: Maybe<Transaction[]>;
    totalSavings: Maybe<number>;
    totalTax: Maybe<number>;
    totalAmount: Maybe<number>;
}

export interface Receipt {
    date: Moment;
    receiptInfo: {
        place: string;
        lane: string;
        operator: string;
    };
    transactions: Transaction[];
    totalSavings: number;
    totalTax: number;
    totalAmount: number;
}

const extractPlace = (selector: string, context: Cheerio) =>
    R.pipe(
        extractText,
        (str) => str, // TODO: Remove extra characters (e.g. ', ')
    )(selector, context);

const extractLane = (selector: string, context: Cheerio) =>
    R.pipe(
        extractText,
        (str) => str, // TODO: Remove extra characters (e.g. ', #')
    )(selector, context);

const extractOperator = (selector: string, context: Cheerio) =>
    R.pipe(
        extractText,
        (str) => str, // TODO: Remove extra characters (e.g. ', #')
    )(selector, context);

const extractTransactions = (selector: string, context: Cheerio) =>
    cheerio(selector, context) &&
    <Maybe<Transaction[]>>{}; // TODO: Extract Each Transaction row

const mapRawReceiptToReceipt = (input: RawReceipt): Maybe<Receipt> =>
    input &&
    input.date.isJust() &&
    input.receiptInfo &&
    input.receiptInfo.lane.isJust() &&
    input.receiptInfo.operator.isJust() &&
    input.receiptInfo.place.isJust() &&
    input.transactions.isJust() &&
    input.totalAmount.isJust() &&
    input.totalSavings.isJust() &&
    input.totalTax.isJust()
        ? Just(
            <Receipt>{
                date: input.date.extract(),
                receiptInfo: {
                    lane: input.receiptInfo.lane.extract(),
                    operator: input.receiptInfo.operator.extract(),
                    place: input.receiptInfo.place.extract(),
                },
                transactions: input.transactions.extract(),
                totalAmount: input.totalAmount.extract(),
                totalSavings: input.totalSavings.extract(),
                totalTax: input.totalTax.extract(),
            })
        : Nothing;

const parseReceiptTransactionsPage = R.curry(
    (pom: ReceiptDetailPageObjectModel, page: Page): Promise<Maybe<Receipt>> =>
        page.content()
            .then((html) => cheerio.load(html))
            .then($ => $(pom.contentContainer))
            .then((content) =>
                (<RawReceipt>{
                    date: extractDate(pom.date, content),
                    receiptInfo: {
                        place: extractPlace(pom.receiptInfo.place, content),
                        lane: extractLane(pom.receiptInfo.lane, content),
                        operator: extractOperator(pom.receiptInfo.operator, content),
                    },
                    transactions: extractTransactions(pom.transactionRow, content),
                    totalSavings: extractFloat(pom.totalAmounts.totalSavings, content),
                    totalTax: extractFloat(pom.totalAmounts.tax, content),
                    totalAmount: extractFloat(pom.totalAmounts.total, content),
                })
            )
            .then(mapRawReceiptToReceipt)
);

const navigateToReceiptDetailsPage = (baseUrl: string, detailsUrl: string, page: Page) =>
    navigateToUrlAndWait(url.resolve(baseUrl, detailsUrl), page);

/**
 * Navigate to a receipt summaries' detail page, and return the parsed Receipt
 *
 *
 * @param baseUrl
 * @param page
 * @param pom
 * @param receiptSummary
 */
const getReceiptTransactions = R.curry(
    (
        baseUrl: string,
        page: Page,
        pom: ReceiptDetailPageObjectModel,
        receiptSummary: ReceiptSummary
    ): Promise<Maybe<Receipt>> =>

        Promise.resolve()
            .then(() => console.log(`Fetching Transactions for ${receiptSummary.url}`))
            .then(() => navigateToReceiptDetailsPage(baseUrl, receiptSummary.url, page))
            .then((result) => {
                // TODO: Replace w/ generic 'Tap'
                console.log(`Parsing Transactions for ${receiptSummary.url}`);
                return result;
            })
            .then(parseReceiptTransactionsPage(pom))
            .then((result) => {
                // TODO: Replace w/ generic 'Tap'
                console.log(`Parse Complete for ${receiptSummary.url}, Success?: ${result.isJust()}`);
                return result;
            }),
);

/**
 * Iterate over the given receipt summary objects then:
 *  1. Execute the mapper to get the receipt detail
 *  2. Filter out bad receipt detail objects
 *  3. Remove the 'maybe' part
 *
 *  @param mapper
 *  @param summaries
 */
const fetchTransactionsForEachReceipt = R.curry(
    (receiptTransactionsFetcher: (summaries: ReceiptSummary) => Promise<Maybe<Receipt>>, summaries: ReceiptSummary[]) =>

        /// TODO: Really refactor this mapper, this is way too hard to understand, and doesn't work at all
        // Get the Transactions for Each Receipt Summary
        // TODO: Make this sequential, it can't happen in parallel (unless we 'clone' the page objects)
        pMapSeries(summaries, receiptTransactionsFetcher)

            // Filter out the transactions that returned as 'Nothing'
            .then(result => R.filter((maybeReceipt: Maybe<Receipt>) => maybeReceipt.isJust(), result))

            // Get all of the maybes together
            .then( result => Maybe.catMaybes(result))

            // Re-group the maybes from a possible nullable.
            .then( result => Maybe.fromNullable(result))
);



const getAllReceiptDetails = R.curry(
    (
        baseUrl: string,
        pom: ReceiptDetailPageObjectModel,
        page: Page,
        receiptSummaries: Maybe<ReceiptSummary[]>
    ): Promise<ActionResponse<Receipt[]>> =>

        receiptSummaries.isNothing()

            // Input was nothing? return Nothing
            ? Promise.resolve( { page, result: Nothing })

            // TODO: This might just need to be a small wrapper function that operates on all receiptSummaries
            // EG: R.map(fetchReceiptTransactions, receiptSummaries.extract());
            // Need to handle the promises though....
            : fetchTransactionsForEachReceipt(
                getReceiptTransactions(baseUrl, page, pom),
                receiptSummaries.extract()
            )

                // Return back the 'Action Result'
                .then(result => ({
                    page,
                    result,
                }))

);


export {
    extractLane,
    extractOperator,
    extractPlace,
    extractTransactions,
    getAllReceiptDetails,
    getReceiptTransactions,
    fetchTransactionsForEachReceipt,
    parseReceiptTransactionsPage,
};

export default getAllReceiptDetails;