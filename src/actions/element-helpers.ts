import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import moment, { Moment } from 'moment';
import R from 'ramda';
import cheerio from 'cheerio';

const extractDate = (selector: string, ctx: Cheerio): Maybe<Moment> =>
    R.pipe(
        extractText(selector),
        parseDate,
    )(ctx);

const extractFloat = (selector: string, ctx: Cheerio) =>
    R.pipe(
        extractText(selector),
        text => text.isJust() ? Maybe.fromNullable(parseFloat(text.extract())) : Nothing,
        num => num.isJust() && !R.identical(NaN, num.extract()) ? num : Nothing,
    )(ctx);

const extractHref = (selector: string, ctx: Cheerio): Maybe<string> =>
    R.pipe(
        (ctx: Cheerio) => cheerio(selector, ctx),
        element => element.attr('href') ? Just(element.attr('href')) : Nothing,
    )(ctx);

const extractText = R.curry(
    (selector: string, ctx: Cheerio) =>
        R.pipe(
            parseText(selector),
            removeNewline,
        )(ctx),
);

const parseDate = (dateString: Maybe<string>): Maybe<Moment> =>
    dateString
        // Filter checks to see if we roughly have the right date format (allow spaces & case difference)
        .filter(R.test(/\s*\w{3}\.?\s*\d{1,2},\s*\d{4}\s*\d{1,2}:\d{1,2}[aApP][mM]\s*/))

        // Remove the spaces
        .map(R.replace(/\s{2,}/g, ' '))

        // Now feed the cleaned & checked value tp moment
        .map(value => moment(value, 'MMM. DD, YYYY hh:mma'))

        // Only if we get a valid date
        .filter(date => date.isValid());

const parseText = R.curry(
    R.pipe(
        (selector: string, ctx: Cheerio): Maybe<Cheerio> =>
            ctx && selector && R.length(selector) > 0
                ? Just(cheerio(selector, ctx))
                : Nothing,
        (element: Maybe<Cheerio>): Maybe<string> =>
            element.isJust()
                ? Maybe.fromNullable(element.extract().text())
                : Nothing,
        (text: Maybe<string>): Maybe<string> =>
            text.isJust() && R.length(text.extract()) > 0
                ? text
                : Nothing,
    )
);

const removeNewline = (text: Maybe<string>) =>
    text.isJust()
        ? Maybe.fromNullable(R.replace(/(\n|\r)?(\r|\n)/g, '', text.extract()))
        : Nothing;

export {
    extractDate,
    extractFloat,
    extractHref,
    extractText,
    parseDate,
    parseText,
    removeNewline,
};