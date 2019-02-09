import R from 'ramda';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import signInPage from './page-objects/sign-in.page';
import { Maybe } from 'purify-ts/adts/Maybe';
import { getWegmansConfig } from './resources/config';

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
const navigateToReceiptsPage = navigateToUrl('https://www.wegmans.com/my-receipts.html');

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

const parseReceiptPage = (page: Page) =>
    page.$$('.myreceipt-table-body .recall-table-set:not(.total-row)')
        .then(rows => Promise.all(R.map(parseReceiptRowElement, rows)))
        .then(data => {
            // TODO: Map this array of objects of element handles => array of objects of strings
            // [{ ElementHandle, El... }, ...] ==> [{ string, string, ...}, ... ]
            console.log(data);
        })
        .then(() => page);


///
/// Main
///
const main = (username: string, password: string) =>
    getBrowser()
        .then(getChromePage)
        .then(signInWithPuppeteer(username, password))

        // Get Receipts Page
        // TODO: Get Receipts Page (aka navigate to this page w/ cookies)

        // Navigate to 'My Receipts Page
        .then(navigateToReceiptsPage)

        // Parse Receipts Page
        .then(parseReceiptPage)

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