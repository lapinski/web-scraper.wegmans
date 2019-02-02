import { URL } from 'url';
import { WegmansConfig, ScreenshotsConfig }  from '../resources/config';
import { SignInPageObjectModel } from '../page-objects/sign-in.page';
import { log, LogLevel } from '../resources/logger';
import { save } from '../resources/screenshots';
import { Page } from 'puppeteer';
import R from 'ramda';

const getSignInUrl = (baseUrl: string, relativePagePath: string) => (new URL(baseUrl, relativePagePath)).toString();
const navigateToSignInPage = (baseUrl: string, relativePagePath: string, page: Page) => page.goto(getSignInUrl(baseUrl, relativePagePath));
const waitForSignInButton = (buttonSelector: string, page: Page) => page.waitFor(buttonSelector);

const fillOutSignInForm = (usernameSelector: string, passwordSelector: string, formSubmitSelector: string,  username: string, password: string, page: Page) =>
    Promise.all([
        page.type(usernameSelector, username),
        page.type(passwordSelector, password)
    ]).then(() => Promise.all([
        page.waitForNavigation(),
        page.click(formSubmitSelector)
    ]));


// TODO: Rearrange params to have it make sense for partial application (e.g. configureSignInAction)
const signInAction = (page: Page, pom: SignInPageObjectModel, wegmansConfig: WegmansConfig, screenshotsConfig: ScreenshotsConfig) =>
  // TODO: Add Logging: log(LogLevel.Info, 'Navigating to Login Page');
  navigateToSignInPage(R.prop('paths.baseUrl', wegmansConfig), R.prop('path', pom), page)
    // log(LogLevel.Info, 'Waiting for Sign In Button to appear', { selector: signInPage.signInButton });
    .then(() => waitForSignInButton(R.prop('signInButton', pom), page))

    // log(LogLevel.Info, 'Filling out Sign-In Form', { username: wegmansConfig.username });
    .then(() =>
        fillOutSignInForm(
            R.prop('usernameInput', pom),
            R.prop('passwordInput', pom),
            R.prop('signInButton', pom),
            R.prop('username', wegmansConfig),
            R.prop('password', wegmansConfig),
            page,
        )
    )
    .then(() => log(LogLevel.Info, 'Sign-In Succeeded'))
    // .catch(() => log(LogLevel.Error, 'Sign-In Failed'))
    // log(LogLevel.Info, 'Saving screenshot');
    .then(() => save(screenshotsConfig, page, 'signin'))
    .then(() => page);


// TODO: Unit Tests each method
export {
    getSignInUrl,
    navigateToSignInPage,
    waitForSignInButton,
    fillOutSignInForm,
    signInAction,
};

// Entry Point
export default signInAction;