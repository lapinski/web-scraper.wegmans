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
import writeReceiptsToDisk from './actions/write-receipts-to-disk';
import { Either } from 'purify-ts/adts/Either';

const tap = R.curry(<T>(f: (input: T) => void, input: T): T => { f(input); return input; });
const tapLogger = (message: string) => tap(() => console.log(message));

const getStartDate = () => moment().startOf('month').subtract(3, 'months').toDate();
const getEndDate = () => moment().startOf('month').add(1, 'month').toDate();

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
        .then(getReceiptSummaryList(baseUrl, MyReceiptsPage, getStartDate(), getEndDate()))
        .then(
            tap((content: ActionResponse<ReceiptSummary[]>) => {
                console.log(`Receipts Returned? ${content.result.isJust()}`);
                console.log(`Number of Receipts: ${content.result.extract().length}`);
            })
        )

        .then(tapLogger('Writing Receipts to Disk'))
        .then(
            tap(
                (response: ActionResponse<ReceiptSummary[]>) =>
                    writeReceiptsToDisk(response.result.extract())
                        .then(eithers => {
                            console.log('Finished Writing Receipts to disk.');
                            const lefts = Either.lefts(eithers);
                            if (lefts.length > 0) {
                                console.log(`Some Errors occured ${lefts.length} writting to disk.`);
                                console.log('Errors from writing to disk');
                                console.log(R.map(err => `${err}\n`, lefts));
                            }
                        })
            )
        )


        // TODO: For each Receipt, Navigate to its' page containing transactions
        // TODO: Parse each Receipt Page
        .then(tapLogger('Fetching Receipt Details'))
        .then((content: ActionResponse<ReceiptSummary[]>): Promise<ActionResponse<Receipt[]>> =>
            content.result.isJust()
                ? getAllReceiptDetails(baseUrl, ReceiptDetailPage, content.page, content.result)
                : Promise.resolve(content)
        )

        .then((content: ActionResponse<Receipt[]>) => {
            // TODO: Save Full Receipt Details (and transactions) to disk
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