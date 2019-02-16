import { getWegmansConfig, isDebugEnabled } from './resources/config';
import { getChromePage, getBrowser, closeBrowser } from './actions/browser-helpers';
import signIn from './actions/sign-in';
import getReceiptSummaryList from './actions/get-receipt-summary-list';
import MyReceiptsPage  from './page-objects/my-receipts.page';
import SignInPage from './page-objects/sign-in.page';
import ReceiptDetailPage from './page-objects/receipt-detail.page';
import getAllReceiptDetails, { Receipt } from './actions/get-receipt-transactions';
import { Page } from 'puppeteer';
import { Maybe, Nothing } from 'purify-ts/adts/Maybe';

const main = (baseUrl: string, username: string, password: string, debug: boolean = false) =>
    getBrowser({ headless: debug })
        .then(getChromePage)
        .then(signIn(baseUrl, SignInPage, username, password))

        // Navigate to 'My Receipts' Page
        // TODO: Allow filtering of Receipts by Date (Start Date / End Date)
        .then(getReceiptSummaryList(baseUrl, MyReceiptsPage))

        // TODO: For each Receipt, Navigate to its' page containing transactions
        // TODO: Parse each Receipt Page
        .then(({ page, receiptSummaries }): Promise<{page: Page, receipts: Maybe<Receipt[]>}> =>
            receiptSummaries.isJust()
                ? getAllReceiptDetails(baseUrl, ReceiptDetailPage, page, receiptSummaries)
                : Promise.resolve({ page, receipts: Nothing })
        )

        .then(({ page, receipts }) => {
            return page;
        })

        // Close Browser
        .then(closeBrowser);

if (module === require.main) {

    const { baseUrl, username, password } = getWegmansConfig();
    const debug = isDebugEnabled();

    main(baseUrl, username, password, debug)
        .then(() => {
            console.log('Success');
        })
        .catch(err => {
            console.error(`Error: ${err.message}`);
        });
}

export {
    main,
};