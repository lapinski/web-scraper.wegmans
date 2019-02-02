jest.mock('../../resources/config', () => ({
    get: jest.fn()
        .mockReturnValueOnce({
            paths: {
                baseUrl: 'https://base.url',
            },
            username: 'defaultUsername',
            password: 'defaultPassword'
        })
}));

jest.mock('../../resources/logger', () => ({
    info: jest.fn()
}));

jest.mock('../../resources/screenshots', () => ({
    save: jest.fn()
}));

import signIn from '../sign-in';
import { Page } from 'puppeteer';

describe('Sign In Action', () => {

    let inputPage: Page;
    let outputPage: Page;
    let MockPage: jest.Mock<Page>;

    beforeAll(async () => {
        MockPage = jest.fn<Page>(() => ({
            goto: jest
                .fn(() => Promise.resolve())
                .mockName('Mocked goto()'),
            waitFor: jest
                .fn(() => Promise.resolve())
                .mockName('mocked waitFor()'),
            type: jest
                .fn(() => Promise.resolve())
                .mockName('mocked type()'),
            waitForNavigation: jest
                .fn(() => Promise.resolve())
                .mockName('mocked waitForNavigation()'),
            click: jest
                .fn(() => Promise.resolve())
                .mockName('mocked click()')
            // TODO: Figure out how to track these mocks (in assertions)
        }));

        // TODO: Mock imports of actions/sign-in.ts
    });

    beforeEach(async () => {
        inputPage = new MockPage();
        outputPage = await signIn(inputPage);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should navigate to the signin URL', () => {
        expect(inputPage.goto).toHaveBeenCalledWith(
            expect.anything()
            // TODO: Ensure the url from mocked config has been used
        );
    });

    it('should fill out the username field', () => {
        expect(inputPage.type).toHaveBeenCalledWith(
            expect.stringContaining('type="email"'),
            expect.anything() // TODO: Make sure it's the username from the mocked config
        );
    });

    it('should fill out the password field', () => {
        expect(inputPage.type).toHaveBeenCalledWith(
            expect.stringContaining('type="password"'),
            expect.anything() // TODO: Make sure it's the password from the mocked config
        );
    });

    it('should click the signin button', () => {
        expect(inputPage.click).toHaveBeenCalledTimes(1);
    });

    it('should save a screenshot', () => {
        // TODO: Mock screenshot module & Assert call was made
    });

    it('should return the original page', () => {
        expect(outputPage).toEqual(inputPage);
    });
});