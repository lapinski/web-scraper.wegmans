import { URL } from 'url';
import * as _ from 'lodash';
import moment, { Moment } from 'moment';

const maybe = (test: (input: string) => string|undefined, value: string) =>
    (test(value) ? value : undefined);


export function extractTextContent(element: Element): string {
    if (!element || !element.textContent) {
        return undefined;
    }

    return element.textContent.toString();
}

export function extractAnchorUrl(element: Element): URL {
    if (!element || !element.hasAttribute('href')) {
        return undefined;
    }

    try {
        return new URL(element.getAttribute('href'));
    } catch(error) {
        return undefined;
    }
}

export function removeNewline(input: string):string {
    return _.replace(input, /\r?\n|\r/g, '');
}

export const parseDate = _.partial(moment, _, 'MMM. DD, YYYY hh:mma');

export const sanitizeDate: (input: string) => Moment = _.flow(
    _.partial(maybe, _.isString), // TODO: Move to input
    removeNewline, // TODO: Move to input
    parseDate, // TODO: Move to input
);

export const sanitizeNumber: (input: string) => number = _.flow(
    _.partial(maybe, _.isString),
    removeNewline,
    _.toNumber,
);