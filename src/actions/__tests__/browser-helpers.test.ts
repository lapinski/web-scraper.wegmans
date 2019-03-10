import { Browser, DirectNavigationOptions, Page, Response } from 'puppeteer';
import {
    closeBrowser,
    getBrowser,
    getChromePage,
    LoadEvent,
    navigateToUrl,
    navigateToUrlAndWait,
} from '../browser-helpers';


describe('puppeteer browser helpers', () => {

    describe('getBrowser()', () => {
        describe('with no options', () => {
            let output: Browser;
            beforeAll(() =>
                getBrowser()
                    .then(browser => {
                        output = browser;
                    })
            );
            afterAll(() => output.close());

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

        describe('with options', () => {
            let browser: Browser;

            beforeAll(() =>
                getBrowser({
                    defaultViewport: {
                        width: 100,
                        height: 200
                    }
                })
                    .then(aBrowser => {
                        browser = aBrowser;
                    })
            );

            afterAll(() => browser.close());

            it('should get a browser that exists', () => {
                expect(browser).not.toBeUndefined();
                expect(browser).not.toBeNull();
            });

            it('should create a page with the expected viewport', () =>
                browser.newPage()
                    .then(page => {
                        expect(page.viewport().width).toBe(100);
                        expect(page.viewport().height).toBe(200);
                    })
            );
        });
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