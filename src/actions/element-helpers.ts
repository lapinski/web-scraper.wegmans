import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import moment, { Moment } from 'moment';
import R from 'ramda';
import cheerio from 'cheerio';

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

const extractText = R.curry(
    (selector: string, ctx: CheerioElement) =>
        R.pipe(
            parseText(selector),
            removeNewline,
        )(ctx),
);

const parseDate = (dateString: Maybe<string>): Maybe<Moment> =>
    dateString.isJust()
        ? Just(moment(dateString.extract(), 'MMM. DD, YYYY hh:mma'))
        : Nothing;

const parseText = R.curry(
    (selector: string, ctx: CheerioElement) => // TODO: Handle case where selector is null/empty
        R.pipe(
            (ctx: CheerioElement) => ctx ? Just(cheerio(selector, ctx)) : Nothing,
            element => element.isJust() ? Just(element.extract().text()) : Nothing,
            text => text.isJust() && text ? text : Nothing,
        )(ctx));

const removeNewline = (text: Maybe<string>) =>
    text.isJust()
        ? Maybe.fromNullable(R.replace(/(\n|\r)?(\r|\n)/, '', text.extract()))
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