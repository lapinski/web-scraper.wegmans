import { navigateToUrlAndWait } from './browser-helpers';
import R from 'ramda';
import { Page } from 'puppeteer';
import signInPage from '../page-objects/sign-in.page';

/**
 * Navigate to the SignIn Page
 */
const navigateToSignIn = navigateToUrlAndWait('https://www.wegmans.com/signin');

/**
 * Fill the Sign In page
 *
 * @param username  Wegmans.com username (email address)
 * @param password  Wegmans.com password
 * @param page      Puppeteer Page context
 *
 * @returns         The original Puppeteer Page context, with the sign-in form filled.
 */
const fillSignInForm = R.curry((username: string, password: string, page: Page) =>
    page.type(signInPage.usernameInput, username)
        .then(() => page.type(signInPage.passwordInput, password))
        .then(() => page));

/**
 * Submit the Sign In form, and wait for the navigation to complete.
 *
 * @param page  Puppeteer Page context
 * @returns     The original Page context, at the dashboard page.
 */
const submitSignInForm = (page: Page) =>
    Promise.all([
        page.waitForNavigation(),
        page.click(signInPage.signInButton)
    ])
        .then(() => page);

/**
 * The main sign-in action, taking a Page context, filling out the form and submitting it.
 *
 * @param username   Wegmans.com username
 * @param password   Wegmans.com password
 * @param page       Puppeteer Page to sign in.
 *
 * @returns          The original Page context
 */
const signIn = R.curry(
    (username: string, password: string, page: Page) =>
        navigateToSignIn(page)
            .then(fillSignInForm(username, password))
            .then(submitSignInForm)
);


// TODO: Unit Tests each method
export {
    navigateToSignIn,
    fillSignInForm,
    submitSignInForm,
    signIn,
};

export default signIn;