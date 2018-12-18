import puppeteer, { Browser, Page } from 'puppeteer';
import config from './config';
import { ILogger } from './logger';

export const IBrowserType = Symbol.for('IBrowser');
export interface IBrowser {
  getPage():Promise<Page>;
  close():Promise<void>;
}

export default class PuppeteerBrowser implements IBrowser {

  private _browser:Browser;
  private _logger:ILogger;

  constructor(logger:ILogger) {
    this._logger = logger;
  }

  private async getBrowser():Promise<Browser> {
    if(this._browser === undefined) {
      this._browser = await puppeteer.launch({ headless: config.get('puppeteer.headless') });
    }

    return Promise.resolve(this._browser);
  }

  public async getPage():Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.setViewport({
      width: config.get('puppeteer.viewport.width'),
      height: config.get('puppeteer.viewport.height'),
    });

    return page;
  }

  public async close():Promise<void> {
    if( this._browser) {
      await this._browser.close();
    }

    return Promise.resolve();
  }
}