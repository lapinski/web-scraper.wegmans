import { Page } from 'puppeteer';

import signIn from '../sign-in';

describe('Sign In Action', () => {

    let page;

    beforeAll(async () => {
        let mockedPage;

        // Execute the Action
        page = signIn(undefined);
    });

    it('should navigate to the signin URL');

    it('should fill out the username field');

    it('should fill out the password field');

    it('should click the signin button');

    it('should save a screenshot');

    it('should return the original page');
});