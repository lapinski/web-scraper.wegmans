import { Browser, Page } from 'puppeteer';
import { getBrowser, getChromePage } from '../../actions/browser-helpers';
import signIn from '../../actions/sign-in';
import SignInPage from '../../page-objects/sign-in.page';
import { getWegmansConfig } from '../../resources/config';


jest.setTimeout(7000);

/**
 * Load up the login action and login to Wegmans.com
 * Make sure the page has loaded
 */
describe('Login to Wegmans', () => {
    let browser: Browser;
    let inputPage: Page;
    let outputPage: Page;

    beforeAll((done) => {
        const { baseUrl, username, password } = getWegmansConfig();

        getBrowser({ headless: true })
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
            })
            .then(() => done());
    });

    afterAll((done) => {
        browser.close()
            .then(() => done());
    });

    it('should not have the username input present', (done) =>
        outputPage
            .$(SignInPage.usernameInput)
            .then(element => {
                expect(element).toBeNull();
                done();
            })
    );

    it('should not have the password input present', (done) => {
        expect(outputPage).not.toBeUndefined();

        outputPage
            .$(SignInPage.passwordInput)
            .then(element => {
                expect(element).toBeNull();
                done();
            });
    });

    it('should not have the login button present', (done) => {
        expect(outputPage).not.toBeUndefined();

        outputPage
            .$(SignInPage.signInButton)
            .then(element => {
                expect(element).toBeNull();
                done();
            });
    });

    it('should be at the expected path', () => {
        expect(outputPage).not.toBeUndefined();

        const currentUrl = outputPage.url();
        expect(currentUrl).toBe('https://www.wegmans.com/');
    });

    it('should have returned the expected cookies', (done) => {
        expect(outputPage).not.toBeUndefined();

        outputPage.cookies()
            .then(cookies => {
                expect(cookies).not.toBeNull();
                done();
            });
    });
});