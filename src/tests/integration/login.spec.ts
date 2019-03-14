import { Browser, Page } from 'puppeteer';
import { getBrowser, getChromePage } from '../../actions/browser-helpers';
import signIn from '../../actions/sign-in';
import SignInPage from '../../page-objects/sign-in.page';
import { getWegmansConfig } from '../../resources/config';

/**
 * Load up the login action and login to Wegmans.com
 * Make sure the page has loaded
 */
describe('Login to Wegmans', () => {
    let browser: Browser;
    let inputPage: Page;
    let outputPage: Page;

    beforeAll(() => {
        const { baseUrl, username, password } = getWegmansConfig();

        return getBrowser({ headless: true })
            .then(aBrowser => {
                browser = aBrowser;
                return getChromePage(aBrowser);
            })
            .then(aPage => {
                inputPage = aPage;
                return signIn(baseUrl, SignInPage, username, password, aPage);
            })
            .then(aPage => {
                outputPage = aPage;
                return browser.close();
            });
    });

    it('should not have the username input present', (done) =>
        outputPage
            .$(SignInPage.usernameInput)
            .then(element => {
                expect(element).toBeNull();
                done();
            })
    );

    it('should not have the password input present', (done) =>
        outputPage
            .$(SignInPage.passwordInput)
            .then(element => {
                expect(element).toBeNull();
                done();
            })
    );

    it('should not have the login button present', (done) =>
        outputPage
            .$(SignInPage.signInButton)
            .then(element => {
                expect(element).toBeNull();
                done();
            })
    );

    it('should be at the expected path', () => {
        const currentUrl = outputPage.url();
        expect(currentUrl).toContain(SignInPage.path);
    });
});