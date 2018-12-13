import { Moment } from 'moment';
import { UrlWithStringQuery } from 'url';

export interface Receipt {
  readonly dateTime: Moment;
  readonly value: number;
  readonly url: UrlWithStringQuery;
};

export interface Transaction {
  readonly quantity: string | null;
  readonly productName: string | null;
  readonly productUrl: string | null;
  readonly productCode: string | null;
  readonly amount: number | null;
  readonly discount: string | null;
}