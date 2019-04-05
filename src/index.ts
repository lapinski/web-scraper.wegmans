import { getWegmansConfig, isDebugEnabled } from './resources/config';
import { getChromePage, getBrowser, closeBrowser } from './actions/browser-helpers';
import signIn from './actions/sign-in';
import getReceiptSummaryList, { ReceiptSummary } from './actions/get-receipt-summary-list';
import MyReceiptsPage  from './page-objects/my-receipts.page';
import SignInPage from './page-objects/sign-in.page';
import ReceiptDetailPage from './page-objects/receipt-detail.page';
import getAllReceiptDetails, { Receipt } from './actions/get-receipt-transactions';
import { Nothing } from 'purify-ts/adts/Maybe';
import R from 'ramda';
import { ActionResponse } from './actions/types';
import moment from 'moment';

const tap = R.curry(<T>(f: (input: T) => void, input: T): T => { f(input); return input; });
const tapLogger = (message: string) => tap(() => console.log(message));

// @ts-ignore
const main = (baseUrl: string, username: string, password: string, debug: boolean = false) =>
    // TODO" Test This out, it should set the date inputs correctly
    getBrowser({ headless: true || debug })
        .then(getChromePage)

        .then(tapLogger('Signing In to Wegmans.com'))

        .then(signIn(baseUrl, SignInPage, username, password))

        .then(tapLogger('DONE - SignedIn\n\n'))

        // Navigate to 'My Receipts' Page
        // TODO: Allow filtering of Receipts by Date (Start Date / End Date)
        .then(tapLogger('Getting List of Receipts'))
        // @ts-ignore
        .then(getReceiptSummaryList(baseUrl, MyReceiptsPage, moment('01/01/2012').valueOf(), moment('01/01/2020').valueOf()))
        .then(tapLogger('DONE'))

        .then(
            tap((content: ActionResponse<ReceiptSummary[]>) => {
                console.log(`Receipts Returned? ${content.result.isJust()}`);
                console.log(`Number of Receipts: ${content.result.extract().length}`);
            })
        )


        // TODO: For each Receipt, Navigate to its' page containing transactions
        // TODO: Parse each Receipt Page
        .then((content: ActionResponse<ReceiptSummary[]>): Promise<ActionResponse<Receipt[]>> =>
            content.result.isJust()
                ? getAllReceiptDetails(baseUrl, ReceiptDetailPage, content.page, content.result)
                : Promise.resolve({ page: content.page, result: Nothing })
        )

        .then((content: ActionResponse<Receipt[]>) => {
            return content.page;
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