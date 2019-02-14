import { Browser, DirectNavigationOptions, Page, Response } from 'puppeteer';
import {
    closeBrowser,
    getBrowser,
    getChromePage, LoadEvent,
    navigateToUrl,
    navigateToUrlAndWait,
} from '../browser-helpers';


describe('puppeteer browser helpers', () => {

    describe('getBrowser()', () => {
        let output: Browser;
        beforeAll(() =>
            getBrowser()
                .then(browser => {
                    output = browser;
                })
        );

        it('should resolve a browser instance', () => {
            expect(output).toBeTruthy();
        });

        it('should have a chrome-like useragent', () =>
            output
                .userAgent()
                .then(ua => {
                    expect(ua).toContain('Chrome');
                })
        );
    });

    describe('getChromePage()', () => {
        const stubBrowser = <Browser>{
        newPage: () => Promise.resolve(<Page>{
            url: () => 'A New Chrome Page'
        })
        };

        let output: Page;
        beforeAll(() =>
            getChromePage(stubBrowser)
                .then(page => {
                    output = page;
                })
        );

        it('should resolve a Page instance', () => {
            expect(output).toBeTruthy();
        });

        it('should resolve a Page at a Bogus Url', () => {
            expect(output.url()).toEqual('A New Chrome Page');
        });
    });

    describe('Navigation Functions', () => {
        let pageUrlState: string;

        const stubPage = <Page>{
            url: () => pageUrlState,
            goto: (url: string, opts: DirectNavigationOptions): Promise<Response> => {
                pageUrlState = url;
                return Promise.resolve(<Response>{});
            }
        };

        afterEach(() => {
            pageUrlState = undefined;
        });

        describe('navigateToUrl()', () => {
            let output: Page;
            beforeEach(() =>
                navigateToUrl(LoadEvent.NoIdleNetwork, 'anUrlDefault', stubPage)
                    .then(page => {
                        output = page;
                    })
            );

            it('should return the same input page context', () => {
                expect(output).toEqual(stubPage);
            });

            it('should return a page at the specified url', () => {
                expect(output.url()).toEqual('anUrlDefault');
            });

            // TODO: Test Negative Input
        });

        describe('navigateToUrlAndWait()', () => {
            let output: Page;
            beforeEach(() =>
                navigateToUrlAndWait('anUrl', stubPage)
                    .then(page => {
                        output = page;
                    })
            );

            it('should return the same input page context', () => {
                expect(output).toEqual(stubPage);
            });

            it('should return a page at the specified url', () => {
                expect(output.url()).toEqual('anUrl');
            });

            // TODO: Test Negative Input
        });
    });

    describe('closeBrowser()', () => {
        let wasClosed = false;

        const stubBrowser = <Browser>{
            close: () => {
                wasClosed = true;
                return Promise.resolve();
            }
        };

        const stubPage = <Page>{
            browser: () => stubBrowser
        };

        beforeAll(() =>
            closeBrowser(stubPage)
        );

        it('should exhibit the side effect of closing the page\'s browser', () => {
            expect(wasClosed).toBe(true);
        });

        // TODO: Test Negative Input
    });
});