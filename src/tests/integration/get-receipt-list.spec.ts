import { Browser, Page } from 'puppeteer';
import { getWegmansConfig } from '../../resources/config';
import { getBrowser, getChromePage } from '../../actions/browser-helpers';
import signIn from '../../actions/sign-in';
import SignInPage from '../../page-objects/sign-in.page';
import getReceiptSummaryList, { ReceiptSummary } from '../../actions/get-receipt-summary-list';
import MyReceiptsPage from '../../page-objects/my-receipts.page';
import { args } from '../chromium-args';
import { Maybe } from 'purify-ts/adts/Maybe';

jest.setTimeout(15000);

describe('Navigate to MyReceipts Page', () => {

    let browser: Browser;
    let inputPage: Page;
    let outputPage: Page;
    let output: Maybe<ReceiptSummary[]>;

    beforeAll((done) => {
        const { baseUrl, username, password } = getWegmansConfig();

        getBrowser({ headless: true, args })
            .then(aBrowser => {
                browser = aBrowser;
                return getChromePage(aBrowser);
            })
            .then(aPage => {
                inputPage = aPage;
                return signIn(baseUrl, SignInPage, username, password, aPage);
            })
            .then(page => getReceiptSummaryList(baseUrl, MyReceiptsPage, page))
            .then(response  => {
                outputPage = response.page;
                output = response.result;
            })
            .then(() => done());
    });

    afterAll((done) => {
        browser.close()
            .then(() => done());
    });

    it('should return something', () => {
        expect(output.isJust()).toBe(true);
        expect(output.extract()).toHaveLength(34);
    });

    it.skip('I\'ll write some tests later', () => {

    });
});