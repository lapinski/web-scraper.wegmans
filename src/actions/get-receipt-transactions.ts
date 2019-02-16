import R from 'ramda';
import { ReceiptSummary } from './get-receipt-summary-list';
import { Page } from 'puppeteer';
import { navigateToUrlAndWait } from './browser-helpers';
import * as url from 'url';
import { ReceiptDetailPageObjectModel } from '../page-objects/receipt-detail.page';
import { Maybe, Nothing } from 'purify-ts/adts/Maybe';

export interface Receipt {

}

const parseReceiptPage = (page: Page, pom: ReceiptDetailPageObjectModel): Promise<Receipt> =>

    page.content()
        .then((html) => cheerio.load(html))
        .then(($) => {

            return <Receipt>{

            };
        });

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
    getAllReceiptDetails,
    getReceiptDetails,
};

export default getAllReceiptDetails;