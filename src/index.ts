import R from 'ramda';
import puppeteer, { Browser } from 'puppeteer';
import signInPage from './page-objects/sign-in.page';
import { Maybe } from 'purify-ts/adts/Maybe';
import { getWegmansConfig } from './resources/config';

const getBrowser = () => puppeteer.launch({headless: true});
const getChromePage = (browser: Browser) => browser.newPage();
const navigateToUrl = R.curry((url: string, page: puppeteer.Page) =>
    page.goto(url)
        .then(() => page));

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

const closeBrowserAndGetCookies = (page: puppeteer.Page) =>
    page.cookies()
        .then(cookies =>
            page
                .browser()
                .close()
                .then(() => cookies)
        );

const formatCookiesAsQuerystring = (cookies: {name: string, value: string}[]) => {

    // TODO: Fix this and make it 'really functional'
    const a = R.filter(cookie => R.startsWith('wegmans', R.prop('name', cookie)), cookies);
    const b = R.map(cookie => `${R.prop('name', cookie)}=${R.prop('value', cookie)}`, a);
    const c = R.join('; ', b);

    return Promise.resolve(Maybe.fromNullable(c));
};

const signInWithPuppeteer = (username: string, password: string) =>
    getBrowser()
        .then(getChromePage)

        // Navigate to SignIn Page
        .then(navigateToSignIn)

        // Fill out Form
        .then(fillSignInForm(username, password))

        // Submit Form
        .then(submitSignInForm)

        // Close Browser and Return Cookies
        .then(closeBrowserAndGetCookies)

        // Format Cookies to QueryString
        .then(formatCookiesAsQuerystring);

const main = (username: string, password: string) =>
    signInWithPuppeteer(username, password)

    // Get Receipts Page
    // TODO: Get REceipts Page (aka navigate to this page w/ cookies)

        // Parse Response
        .then(response => {
            // TODO: Parse this REAL response.
            // console.log(JSON.stringify(response.data, undefined, 2));
        });


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