import { URL } from 'url';
import { Page as PuppetPage } from 'puppeteer';

export default class PageObject {

  private readonly _page: PuppetPage;

  constructor(page: PuppetPage) {
    this._page = page;
  }

  protected get page() {
    return this._page;
  }

  protected extractTextContent(element: Element):string {
    if (!element || !element.textContent) {
      return undefined;
    }

    return element.textContent.toString();
  }

  protected extractAnchorUrl(element: Element):URL {
    if (!element || !element.hasAttribute('href')) {
      return undefined;
    }

    return new URL(element.getAttribute('href'));
  }
};