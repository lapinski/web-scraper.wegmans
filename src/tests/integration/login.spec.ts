import { Browser, Cookie, Page } from 'puppeteer';
import R from 'ramda';
import jwtDecode from 'jwt-decode';
import { getBrowser, getChromePage } from '../../actions/browser-helpers';
import signIn from '../../actions/sign-in';
import SignInPage from '../../page-objects/sign-in.page';
import { getWegmansConfig } from '../../resources/config';
import { args } from '../chromium-args';
import * as path from 'path';

jest.setTimeout(20000);

/**
 * Load up the login action and login to Wegmans.com
 * Make sure the page has loaded
 */
describe('Login to Wegmans', () => {
    const getCookieByName = (name: string) => R.find(R.propEq('name', name));

    let browser: Browser;
    let inputPage: Page;
    let outputPage: Page;
    let cookies: Cookie[];

    beforeAll((done) => {
        const { baseUrl, username, password } = getWegmansConfig();

        expect(baseUrl).not.toBeUndefined();
        expect(username).not.toBeUndefined();
        expect(password).not.toBeUndefined();

        getBrowser({ args })
            .then(aBrowser => {
                browser = aBrowser;
                expect(browser).not.toBeUndefined();
                return getChromePage(aBrowser);
            })
            .then(aPage => {
                inputPage = aPage;
                expect(inputPage).not.toBeUndefined();
                return signIn(baseUrl, SignInPage, username, password, aPage);
            })
            .then(aPage => {
                outputPage = aPage;
                return aPage.cookies();
            })
            .then(pageCookies => {
                cookies = pageCookies;
            })
            .catch(error => {
                return inputPage.screenshot({
                    path: path.join(__dirname, '..', 'screenshots', 'error.png'),
                    type: 'png',
                }).then(() => done(error));
            })
            .then(() => done());
    });

    afterAll((done) => {
        outputPage.close()
            .then(() => browser.close())
            .then(() => done());
    });

    it('should not have the username input present', (done) => {
        expect(outputPage).not.toBeUndefined();

        outputPage
            .$(SignInPage.usernameInput)
            .then(element => {
                expect(element).toBeNull();
                done();
            });
    });

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

    it('should have returned the expected number of cookies', () => {
        expect(cookies).toHaveLength(24);
    });

    it('should have the wegmans_access cookie', () => {
        const accessCookie = getCookieByName('wegmans_access')(cookies);
        expect(accessCookie).not.toBeUndefined();

        const decodedAccessCookie = jwtDecode(R.prop('value', accessCookie));
        expect(decodedAccessCookie)
            .toHaveProperty('iss', 'https://idp.api.wegmans.com/');
    });

    it('should have the wegmans_refresh cookie', () => {
        expect(getCookieByName('wegmans_refresh')(cookies)).not.toBeUndefined();
    });
});