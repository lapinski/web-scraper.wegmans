import url from 'url';
import R from 'ramda';
import { Page } from 'puppeteer';
import { SignInPageObjectModel } from '../page-objects/sign-in.page';
import { navigateToUrlAndWait } from './browser-helpers';


/**
 * Fill the Sign In page
 *
 * @param usernameInputSelector     CSS Selector for the username input
 * @param passwordInputSelector     CSS Selector for the password input
 * @param username                  Wegmans.com username (email address)
 * @param password                  Wegmans.com password
 * @param page                      Puppeteer Page context
 *
 * @returns   The original Puppeteer Page context, with the sign-in form filled.
 */
const fillSignInForm = R.curry(
    (
        usernameInputSelector: string,
        passwordInputSelector: string,
        username: string,
        password: string,
        page: Page
    ): Promise<Page> =>
    page.type(usernameInputSelector, username)
        .then(() => page.type(passwordInputSelector, password))
        .then(() => page)
);

/**
 * Submit the Sign In form, and wait for the navigation to complete.
 *
 * @param submitButtonSelector CSS Selector for the Submit Button
 * @param page                 Puppeteer Page context
 * @returns                    The original Page context, at the dashboard page.
 */
const submitSignInForm = R.curry(
    (submitButtonSelector: string, page: Page) =>
        Promise.all([
            page.waitForNavigation(),
            page.click(submitButtonSelector)
        ])
            .then(() => page)
);

/**
 * The main sign-in action, taking a Page context, filling out
 * the form and submitting it.
 *
 * @param baseUrl   Wegmans.com base url (e.g. https://www.wegmans.com)
 * @param pom       Sign-In page object model (contains paths and CSS selectors)
 * @param username  Wegmans.com username
 * @param password  Wegmans.com password
 * @param page      Puppeteer Page to sign in.
 *
 * @returns         The original Page context
 */
const signIn = R.curry(
    (
        baseUrl: string,
        pom: SignInPageObjectModel,
        username: string,
        password: string,
        page: Page
    ) =>
        navigateToUrlAndWait(url.resolve(baseUrl, R.prop('path', pom)), page)
            .then(
                fillSignInForm(
                    R.prop('usernameInput', pom),
                    R.prop('passwordInput', pom),
                    username,
                    password
                )
            )
            .then(submitSignInForm(R.prop('signInButton', pom)))
);


// TODO: Unit Tests each method
export {
    fillSignInForm,
    submitSignInForm,
    signIn,
};

export default signIn;