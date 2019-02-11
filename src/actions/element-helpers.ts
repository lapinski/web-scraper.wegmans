import { curry, is, pipe, prop, replace } from 'ramda';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import moment, { Moment } from 'moment';

// TODO: Refactor away this 'pseudo maybe'
export const maybe = curry(<T>(test: (input: T) => Maybe<T>, value: T) =>
    (test(value) ? Just(value) : Nothing));

export const extractTextContent = (element: Element) =>
    (!element || !prop('textContent', element))
        ? Nothing
        : Just(prop('textContent', element));

export const removeNewline = (input: Maybe<string>) =>
    input.isJust()
        ? Just(replace(/\r?\n|\r/g, '', input.extract()))
        : Nothing;

export const parseDate = (input: Maybe<string>) =>
    input.isJust()
        ? pipe(
            (input: Maybe<string>) => moment(input.extract(), 'MMM. DD, YYYY hh:mma'),
            (input: Moment) => input.isValid() ? Just(input) : Nothing
          )(input)
        : Nothing;

export const sanitizeDate =
    pipe(
        maybe(is(String)),
        removeNewline,
        parseDate,
    );

const maybeParseFloat = (input: Maybe<string>) =>
    input.isJust()
        ? Just(parseFloat(input.extract()))
        : Nothing;

export const sanitizeNumber =
    pipe(
        maybe(is(String)),
        removeNewline,
        maybeParseFloat,
    );