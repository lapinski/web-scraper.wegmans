import { URL } from 'url';
import { curry, is, pipe, prop, replace } from 'ramda';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import moment from 'moment';

const maybe = curry(<T>(test: (input: T) => Maybe<T>, value: T) =>
    (test(value) ? Just(value) : Nothing));

export const extractTextContent = (element: Element) =>
    (!element || !prop('textContent', element))
        ? Nothing
        : Just(prop('textContent', element));

export function extractAnchorUrl(element: Element): URL {
    if (!element || !element.hasAttribute('href')) {
        return undefined;
    }

    try {
        return new URL(element.getAttribute('href'));
    } catch (error) {
        return undefined;
    }
}

export const removeNewline = (input: Maybe<string>) =>
    input.isJust()
        ? Just(replace(/\r?\n|\r/g, '', input.extract()))
        : Nothing;

export const parseDate = (input: Maybe<string>) =>
    input.isJust()
        ? moment(input.extract(), 'MMM. DD, YYYY hh:mma')
        : Nothing;

export const sanitizeDate =
    pipe(
        maybe(is(String)),
        removeNewline,
        parseDate,
    );

const maybeParseFloat = (input: Maybe<string>) =>
    input.isJust()
        ? parseFloat(input.extract())
        : Nothing;

export const sanitizeNumber =
    pipe(
        maybe(is(String)),
        removeNewline,
        maybeParseFloat,
    );