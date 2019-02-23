import {
    fillSignInForm,
    submitSignInForm,
    signIn,
} from '../sign-in';
import { Page } from 'puppeteer';
import { SignInPageObjectModel } from '../../page-objects/sign-in.page';
import { LoadEvent } from '../browser-helpers';

describe.skip('Sign In Action', () => {

    const MockedPage = jest.fn<Page>(() => ({
        goto: jest
            .fn()
            .mockName('Page.goto')
            .mockResolvedValue(void 0),
        type: jest
            .fn()
            .mockName('Page.type')
            .mockResolvedValue(void 0),
        waitForNavigation: jest
            .fn()
            .mockName('Page.waitForNavigation')
            .mockResolvedValue(void 0),
        click: jest
            .fn()
            .mockName('Page.click')
            .mockResolvedValue(void 0),
    }));

    describe('fillSignInForm()', () => {

        let output: Page;
        let mockedInputPage: Page;

        beforeAll(() => {
            mockedInputPage = new MockedPage();

            return fillSignInForm(
                'usernameSelector',
                'passwordSelector',
                'usernameValue',
                'passwordValue',
                mockedInputPage,
            ).then(returnedPage => {
                output = returnedPage;
            });
        });

        afterAll(() => {
            MockedPage.mockClear();
        });

        it('should have typed username', () => {
            expect(mockedInputPage.type)
                .toHaveBeenCalledWith('usernameSelector', 'usernameValue');
        });

        it('should have typed password', () => {
            expect(mockedInputPage.type)
                .toHaveBeenCalledWith('passwordSelector', 'passwordValue');
        });

        it('should have returned the original page', () => {
            expect(output).toBe(mockedInputPage);
        });
    });

    describe('submitSignInForm()', () => {
        let output: Page;
        let mockedInputPage: Page;

        beforeAll(() => {
            mockedInputPage = new MockedPage();

            return submitSignInForm(
                'buttonSelector',
                mockedInputPage,
            ).then(returnedPage => {
                output = returnedPage;
            });
        });

        afterAll(() => {
            MockedPage.mockClear();
        });

        it('should clicked Submit Button', () => {
            expect(mockedInputPage.click)
                .toHaveBeenCalledWith('buttonSelector');
        });

        it('should return the same page', () => {
            expect(output).toBe(mockedInputPage);
        });
    });

    describe('signIn()', () => {
        let output: Page;
        let mockedInputPage: Page;

        const stubPOM = <SignInPageObjectModel>{
            path: 'stub-path',
            usernameInput: '',
            passwordInput: '',
            signInButton: '',
        };

        beforeAll(() => {
            mockedInputPage = new MockedPage();

            return signIn(
                'https://www.baseurl.com',
                stubPOM,
                'usernameValue',
                'passwordValue',
                mockedInputPage,
            ).then(returnedPage => {
                output = returnedPage;
            });
        });

        afterAll(() => {
            MockedPage.mockClear();
        });

        it('should navigate to the correct url', () => {
            expect(mockedInputPage.goto)
                .toHaveBeenCalledWith(
                    `https://www.baseurl.com/${stubPOM.path}`,
                    { waitUntil: LoadEvent.AlmostNoIdleNetwork }
                );
        });

        it('should type the username with the correct selector', () => {
            expect(mockedInputPage.type)
                .toHaveBeenCalledWith(stubPOM.usernameInput, 'usernameValue');
        });

        it('should type the password with the correct selector', () => {
            expect(mockedInputPage.type)
                .toHaveBeenCalledWith(stubPOM.passwordInput, 'passwordValue');
        });

        it('should clicked Submit Button with the correct selector', () => {
            expect(mockedInputPage.click)
                .toHaveBeenCalledWith(stubPOM.signInButton);
        });

        it('should return the same page', () => {
            expect(output).toBe(mockedInputPage);
        });
    });
});