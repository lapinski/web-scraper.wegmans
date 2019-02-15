import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import R from 'ramda';

export enum LoadEvent {
    Load = 'load',
    DOMContentLoaded = 'domcontentloaded',
    NoIdleNetwork = 'networkidle0',
    AlmostNoIdleNetwork = 'networkidle2'
}

/**
 * Get a Browser instance from Puppeteer
 *
 * @param options Options for the puppeteer Browser or undefined.
 * @returns An initialized Browser object.
 */
const getBrowser = (options?: LaunchOptions) => puppeteer.launch(options);

/**
 * Get a Page instance from a Puppeteer Browser
 * @param browser The browser object.
 * @returns Page
 */
const getChromePage = (browser: Browser) => browser.newPage();

/**
 * Navigate to a given url and wait for the given event, and resolve the original page.
 *
 * @param loadEvent - The event to wait until to consider navigation complete.
 * @param url - The url to navigate the page object to.
 * @param page - The page context to use for navigation.
 * @returns The original page context, at the given url.
 */
const navigateToUrl = R.curry(
    (loadEvent: LoadEvent, url: string, page: Page): Promise<Page> =>
        page.goto(url, { waitUntil: loadEvent })
            .then(() => page)
);

/**
 * Close the given browser associated with a Page context.
 *
 * @param page
 */
const closeBrowser = (page: Page) => page.browser().close();

/**
 * Navigate to a given page and wait for almost no network connections.
 *
 * @param url The url to update the page context.
 * @param page The page context to update.
 * @returns page The original page context.
 */
const navigateToUrlAndWait = navigateToUrl(LoadEvent.AlmostNoIdleNetwork);

export {
    getBrowser,
    getChromePage,
    navigateToUrl,
    navigateToUrlAndWait,
    closeBrowser,
};
