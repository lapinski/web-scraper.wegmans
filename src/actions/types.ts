import { Page } from 'puppeteer';
import { Maybe } from 'purify-ts/adts/Maybe';

export interface ActionResponse<R> {
    page: Page;
    result: Maybe<R>;
}
