import R from 'ramda';
import cheerio from 'cheerio';
import { ElementHandle, Page } from 'puppeteer';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import { getWegmansConfig } from './resources/config';
import moment, { Moment } from 'moment';
import { getChromePage, getBrowser, navigateToUrlAndWait, closeBrowser } from './actions/browser-helpers';
import signIn from './actions/sign-in';


///
/// Get Receipts
///
const navigateToMyReceiptsPage = navigateToUrlAndWait('https://www.wegmans.com/my-receipts.html');

// Step 1.
interface SanitizedReceiptSummary {
    date: Maybe<Moment>;

    // TODO: Maybe introduce nicely structured postal address?
    postalAddress: {
        street: Maybe<string>,
        town: Maybe<string>,
    };
    amount: Maybe<number>;
    url: Maybe<string>;
}

// Step 2. (if all props are 'Just' in Step 2)
interface ReceiptSummary {
    date: Moment;
    postalAddress: {
        street: string,
        town: string,
    };
    amount: number;
    url: string;
}


const parseText = R.curry(
    (selector: string, ctx: CheerioElement) =>
        R.pipe(
            (ctx: CheerioElement) => cheerio(selector, ctx),
                element => element ? Just(element.text()) : Nothing
        )(ctx));

const removeNewline = (text: Maybe<string>) =>
    text.isJust()
        ? Maybe.fromNullable(R.replace(/(\n|\r)?(\r|\n)/, '', text.extract()))
        : Nothing;

const extractText = R.curry(
    (selector: string, ctx: CheerioElement) =>
        R.pipe(
            parseText(selector),
            removeNewline,
        )(ctx)
);

const parseDate = (dateString: Maybe<string>): Maybe<Moment> =>
    dateString.isJust()
        ? Just(moment(dateString.extract(), 'MMM. DD, YYYY hh:mma'))
        : Nothing;

const extractDate = (selector: string, ctx: CheerioElement): Maybe<Moment> =>
    R.pipe(
        extractText(selector),
        parseDate,
        date => (date.isJust() && date.extract().isValid()) ? date : Nothing,
    )(ctx);

const extractFloat = (selector: string, ctx: CheerioElement) =>
    R.pipe(
        extractText(selector),
        text => text.isJust() ? Maybe.fromNullable(parseFloat(text.extract())) : Nothing,
    )(ctx);

const extractHref = (selector: string, ctx: CheerioElement) =>
    R.pipe(
        (ctx: CheerioElement) => cheerio(selector, ctx),
        element => element ? Just(element.attr('href')) : Nothing,
    )(ctx);

const isValidReceiptSummary = (input: SanitizedReceiptSummary): boolean =>
    input ?
        input.date.isJust() &&
        input.postalAddress.street.isJust() &&
        input.postalAddress.town.isJust() &&
        input.amount.isJust() &&
        input.url.isJust()
        : false;

const extractReceiptSummaryFromRow = (row: CheerioElement): SanitizedReceiptSummary => ({
    date: extractDate('.date-time label:not(.currency)', row),
    postalAddress: {
        street: extractText('.product-recall .address', row),
        town: extractText('.product-recall .company', row),
    },
    amount: extractFloat('.sold-view .sold-col .currency', row),
    url: extractHref('.sold-view .view-col a', row),
});

const extractReceiptSummaryFromMaybe = (input: SanitizedReceiptSummary): ReceiptSummary =>
    ({
        date: R.prop('date', input).extract(),
        postalAddress: {
            street: input.postalAddress.street.extract(),
            town: input.postalAddress.town.extract(),
        },
        amount: R.prop('amount', input).extract(),
        url: R.prop('url', input).extract()
    });

const parseMyReceiptsRows = R.pipe(
    (input: Cheerio) => input ? Just(input.toArray()) : Nothing,
    rows => rows.isJust() ? Just(R.map(extractReceiptSummaryFromRow, rows.extract())) : Nothing,
    rows => rows.isJust() ? Just(R.filter(isValidReceiptSummary, rows.extract())) : Nothing,
    rows => rows.isJust() ? Just(R.map(extractReceiptSummaryFromMaybe, rows.extract())) : Nothing,
);

const parseMyReceiptsPageWithCheerio = (page: Page) =>
    page.content()
        .then(cheerio.load)
        .then($ => $('.myreceipt-table-body .recall-table-set:not(.total-row)'))
        .then(rows => {

            const finalRows = parseMyReceiptsRows(rows);

            return page;
        });


///
/// Main
///
const main = (username: string, password: string) =>
    getBrowser()
        .then(getChromePage)
        .then(signIn(username, password))

        // Navigate to 'My Receipts' Page
        // TODO: Allow filtering of Receipts by Date (Start Date / End Date)
        .then(navigateToMyReceiptsPage)

        // Parse 'My Receipts' Page
        // .then(parseMyReceiptsPage)
        .then(parseMyReceiptsPageWithCheerio)

        // TODO: For each Receipt, Navigate to its' page containing transactions

        // TODO: Parse each Receipt Page

        // Close Browser
        .then(closeBrowser);


if (module === require.main) {

    const { username, password } = getWegmansConfig();

    main(username, password)
        .then(() => {
            console.log('Success');
        })
        .catch(err => {
            console.error(`Error: ${err.message}`);
        });
}

export {
    main,
};