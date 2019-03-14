import { Maybe, Nothing } from 'purify-ts/adts/Maybe';
import { Page } from 'puppeteer';
import R from 'ramda';
import * as url from 'url';

import { extractDate, extractFloat, extractText } from './element-helpers';
import { ReceiptSummary } from './get-receipt-summary-list';
import { navigateToUrlAndWait } from './browser-helpers';
import { ReceiptDetailPageObjectModel } from '../page-objects/receipt-detail.page';


export interface Receipt {

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
    <{}[]>[]; // TODO: Extract Each Transaction row

const parseReceiptPage = (page: Page, pom: ReceiptDetailPageObjectModel): Promise<Receipt> =>
    page.content()
        .then((html) => cheerio.load(html))
        .then($ => $(pom.contentContainer))
        .then((content) =>
            (<Receipt>{
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
        );

/**
 * Navigate to a receipt summaries' detail page, and return the parsed Receipt
 *
 *
 * @param baseUrl
 * @param page
 * @param pom
 * @param receiptSummary
 */
const getReceiptDetails = R.curry(
    (baseUrl: string,
    page: Page,
    pom: ReceiptDetailPageObjectModel,
    receiptSummary: ReceiptSummary):
    Promise<Maybe<Receipt>> =>

        navigateToUrlAndWait(url.resolve(baseUrl, receiptSummary.url), page)
            .then(() => parseReceiptPage(page, pom))
            .then((receipt) => Maybe.fromNullable(receipt)),
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
const parseAndFilterReceipts = R.curry(
    (mapper: (summary: ReceiptSummary) => Promise<Maybe<Receipt>>, summaries: ReceiptSummary[]) =>
        R.pipe(
            R.map(mapper),
            Promise.all,
            R.filter((maybeReceipt: Maybe<Receipt>) => maybeReceipt.isJust()),
            Maybe.catMaybes, // list of maybes => list of values
        )(summaries));

const getAllReceiptDetails = R.curry(
    (baseUrl: string,
    pom: ReceiptDetailPageObjectModel,
    page: Page,
    receiptSummaries: Maybe<ReceiptSummary[]>):
    Promise<{ page: Page, receipts: Maybe<Receipt[]>}> =>

        receiptSummaries.isJust()
            ? Promise.resolve({
                page,
                receipts: Maybe.fromNullable(
                    parseAndFilterReceipts(
                        getReceiptDetails(baseUrl, page, pom),
                        receiptSummaries.extract()
                    )
                )
            })
            : Promise.resolve( { page, receipts: Nothing })
);


export {
    extractLane,
    extractOperator,
    extractPlace,
    extractTransactions,
    getAllReceiptDetails,
    getReceiptDetails,
    parseAndFilterReceipts,
    parseReceiptPage,
};

export default getAllReceiptDetails;