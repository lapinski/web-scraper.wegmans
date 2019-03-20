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
        .chain(value => Just(moment(value, 'MMM. DD, YYYY hh:mma')))
        .chain(value => value.isValid() ? Just(value) : Nothing);

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