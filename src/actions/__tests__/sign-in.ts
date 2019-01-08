jest.mock('puppeteer');
jest.mock('../resources/config');
jest.mock('../resources/logger');
jest.mock('../resources/screenshots');

import signIn from '../sign-in';
import { Page } from 'puppeteer';


describe('Sign In Action', () => {

    let inputPage: Page;
    let outputPage: Page;

    beforeAll(async () => {
        let MockPage = jest.fn<Page>(() => ({
            goto: jest.fn().mockResolvedValue(undefined),
            waitFor: jest.fn().mockResolvedValue(undefined),
            type: jest.fn().mockResolvedValue(undefined),
            waitForNavigation: jest.fn().mockResolvedValue(undefined),
            click: jest.fn().mockResolvedValue(undefined)
        }));

        // TODO: Mock imports of actions/sign-in.ts

        let inputPage = new MockPage();

        outputPage = await signIn(inputPage);
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