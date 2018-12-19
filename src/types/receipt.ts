import { Moment } from 'moment';
import { UrlWithStringQuery } from 'url';

export interface RawTransaction {
  readonly quantity: string | undefined;
  readonly productName: string | undefined;
  readonly productUrl: string | undefined;
  readonly productCode: string | undefined;
  readonly amount: number | undefined;
  readonly discount: string | undefined;
}