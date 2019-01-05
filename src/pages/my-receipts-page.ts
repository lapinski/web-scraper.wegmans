import { Page as PuppetPage } from 'puppeteer';
import PageObject from './page-object';

export type RawReceipt = {
  date: string,
  amount: string,
  url: URL,
};

export class MyReceiptsPage extends PageObject {

  private static readonly _receiptTableSelector = '.recall-table-set';
  private static readonly _dateFieldSelector = '.date-time';
  private static readonly _amountFieldSelector = '.sold-col';
  private static readonly _productUrlSelector = '.view-col a';

  constructor(page: PuppetPage) {
    super(page);
  }

  /**
   * Get table of receipt totals / date
   */
  public async getReceipts(): Promise<ReadonlyArray<RawReceipt>> {
    return this.page
      .$$eval(MyReceiptsPage._receiptTableSelector,
          rowParts => Array.from(rowParts)
          .map(this.parseReceiptRow),
    );
  }

  private parseReceiptRow(row: Element) {
    const dateElem = row.querySelector(MyReceiptsPage._dateFieldSelector);
    const amountElem = row.querySelector(MyReceiptsPage._amountFieldSelector);
    const urlElem = row.querySelector(MyReceiptsPage._productUrlSelector);

    return {
      date: this.extractTextContent(dateElem),
      amount: this.extractTextContent(amountElem),
      url: this.extractAnchorUrl(urlElem),
    };
  }
}