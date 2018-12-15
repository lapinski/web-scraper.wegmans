import { Moment } from 'moment';
import { UrlWithStringQuery } from 'url';

export interface RawReceipt {
  readonly dateTime: Moment;
  readonly value: number;
  readonly url: UrlWithStringQuery;
}

export interface RawTransaction {
  readonly quantity: string | undefined;
  readonly productName: string | undefined;
  readonly productUrl: string | undefined;
  readonly productCode: string | undefined;
  readonly amount: number | undefined;
  readonly discount: string | undefined;
}