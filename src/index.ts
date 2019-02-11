import R from 'ramda';
import cheerio from 'cheerio';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import signInPage from './page-objects/sign-in.page';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import { getWegmansConfig } from './resources/config';
import moment, { Moment } from 'moment';

///
/// "Browser Helpers"
///
const getBrowser = () => puppeteer.launch({headless: false});
const getChromePage = (browser: Browser) => browser.newPage();
const navigateToUrl = R.curry(
    (url: string, page: puppeteer.Page) =>
        page.goto(url, { waitUntil: 'networkidle2' })
            .then(() => page)
);
const closeBrowser = (page: puppeteer.Page) => page.browser().close();


///
/// Sign In Actions
///
const navigateToSignIn = navigateToUrl('https://www.wegmans.com/signin');
const fillSignInForm = R.curry((username: string, password: string, page: puppeteer.Page) =>
    page.type(signInPage.usernameInput, 'wegmans@alexlapinski.name')
        .then(() => page.type(signInPage.passwordInput, 'momoiro72'))
        .then(() => page));
const submitSignInForm = (page: puppeteer.Page) =>
    Promise.all([
        page.waitForNavigation(),
        page.click(signInPage.signInButton)
    ])
        .then(() => page);
const signInWithPuppeteer = R.curry(
    (username: string, password: string, page: Page) =>
        navigateToSignIn(page)
            .then(fillSignInForm(username, password))
            .then(submitSignInForm)
);


///
/// Get Receipts
///
const navigateToMyReceiptsPage = navigateToUrl('https://www.wegmans.com/my-receipts.html');

const parseReceiptRowElement = (row: ElementHandle) =>
    Promise.all([
        // TODO: Extract each of these 'element extractors' to their own configurable functions (passed in as options)
        row.$eval('.date-time', el => el.textContent),
        row.$eval('.product-recall', el => el.textContent),
        row.$eval('.sold-view .sold-col', el => el.textContent),
        row.$eval('.sold-view .view-col a', el => el.getAttribute('href'))])
        .then(([ date, address, amount, url ]) => ({
            date,
            address,
            amount,
            url}));

// Step 1.
interface RawReceiptSummary {
    date: string;
    address: string;
    amount: string;
    url: string;
}

// Step 2.
interface SanitizedReceiptSummary {
    date: Maybe<Moment>;

    // TODO: Maybe introduce nicely structured postal address?
    address: Maybe<string>;
    amount: Maybe<number>;
    url: Maybe<URL>;
}

// Step 3. (if all props are 'Just' in Step 2)
interface ReceiptSummary {
    date: Moment;
    address: string;
    amount: number;
    url: URL;
}

const parseMyReceiptsPage = (page: Page) =>
    page.$$('.myreceipt-table-body .recall-table-set:not(.total-row)')
        .then(rows => Promise.all(R.map(parseReceiptRowElement, rows)))
        .then(rawReceipts => {

            // TODO: Sanitize Receipt Summary Information
            /*
            const sanitizeReceiptSummaries = R.map((rawReceiptSummary: RawReceiptSummary) =>
                (<SanitizedReceiptSummary>{
                    // TODO: Implement 'maybeSanitize' funcs
                    date: maybeSanitizeDate(rawReceiptSummary.date),
                    address: maybeSanitizeAddress(rawReceiptSummary.address),
                    amount: maybeSanitizeAmount(rawReceiptSummary.amount),
                    url: maybeSanitizeUrl(rawReceiptSummary.url),
                }));

            const justCleanReceipts = R.filter(
                (sanitizedReceipt: SanitizedReceiptSummary) =>
                    sanitizedReceipt.address.isJust() &&
                    sanitizedReceipt.amount.isJust() &&
                    sanitizedReceipt.date.isJust() &&
                    sanitizedReceipt.url.isJust()
            );

            const cleanReceipts = R.map( (sanitizeReceipt: SanitizedReceiptSummary) => ({
                    address: sanitizeReceipt.address.extract(),
                    amount: sanitizeReceipt.amount.extract(),
                    date: sanitizeReceipt.date.extract(),
                    url: sanitizeReceipt.url.extract(),
                }),

                // TODO: Refactor
                justCleanReceipts(sanitizeReceiptSummaries(rawReceipts))
            );

                console.log(sanitizeReceiptSummaries(rawReceipts));

            */
            console.log(rawReceipts);


        })
        .then(() => page);

const parseMyReceiptsPageWithCheerio = (page: Page) =>
    page.content()
        .then(cheerio.load)
        .then($ => $('.myreceipt-table-body .recall-table-set:not(.total-row)'))
        .then(rows => {
            console.log(rows);

            // TODO: Move all of these 'small' functions to the 'GetReceiptSummaries' Action (module)
            const removeNewline = R.replace(/(\n|\r)?(\r|\n)/, '');

            const maybeGetText = (selector: string) => R.pipe(
                (ctx: CheerioElement) => cheerio(selector, ctx),
                element => element ? Just(element.text()) : Nothing,
            );

            const extractDate = maybeGetText('.date-time label:not(.currency)');


            const extract = R.map((row: CheerioElement) => ({

                // TODO: Refactor to have a 'ParseDate' and/or 'ExtractDate' function
                date: moment(removeNewline(cheerio('.date-time label:not(.currency)', row).text()), 'MMM. DD, YYYY hh:mma'),

                // TODO: Extract 'ParseAddress' or 'ExtractAddress' function
                postalAddress: {
                    street: cheerio('.product-recall .address', row).text(),
                    town: cheerio('.product-recall .company', row).text(),
                },

                // TODO: Extract 'ParseDollarAmount' and/or 'ExtractDollarAmount' function
                totalAmount: parseFloat(cheerio('.sold-view .sold-col .currency', row).text()),

                // TODO: Extract 'ParseUrl' or 'ExtractUrl' function
                url: cheerio('.sold-view .view-col a', row).attr('href'),
            }));

            const parsedRows = extract(rows.toArray());

            return page;
        });


///
/// Main
///
const main = (username: string, password: string) =>
    getBrowser()
        .then(getChromePage)
        .then(signInWithPuppeteer(username, password))

        // Navigate to 'My Receipts' Page
        // TODO: Allow filtering of Receipts by Date (Start Date / End Date)
        .then(navigateToMyReceiptsPage)

        // Parse 'My Receipts' Page
        // .then(parseMyReceiptsPage)
        .then(parseMyReceiptsPageWithCheerio)

        // TODO: For each Receipt, Navigate to its' page containing transactions

        // TODO: Parse each Receipt Page

        // Close Browser
        .then(closeBrowser);


if (module === require.main) {

    const { username, password } = getWegmansConfig();

    main(username, password)
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