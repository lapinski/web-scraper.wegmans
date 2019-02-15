import { getWegmansConfig, isDebugEnabled } from './resources/config';
import { getChromePage, getBrowser, closeBrowser } from './actions/browser-helpers';
import signIn from './actions/sign-in';
import getReceiptSummaryList from './actions/get-receipt-summary-list';
import MyReceiptsPage  from './page-objects/my-receipts.page';
import SignInPage from './page-objects/sign-in.page';

const main = (baseUrl: string, username: string, password: string, debug: boolean = false) =>
    getBrowser({ headless: debug })
        .then(getChromePage)
        .then(signIn(baseUrl, SignInPage, username, password))

        // Navigate to 'My Receipts' Page
        // TODO: Allow filtering of Receipts by Date (Start Date / End Date)
        .then(getReceiptSummaryList(baseUrl, MyReceiptsPage))
        .then(([page, finalRows]) => {

            console.log(finalRows);

            return Promise.resolve(page);
        })

        // TODO: For each Receipt, Navigate to its' page containing transactions

        // TODO: Parse each Receipt Page

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