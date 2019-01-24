import { URL } from "url";
import * as _ from 'lodash';
import moment, { Moment } from 'moment';
import { maybe } from '../parsers/receipt-parser';

function extractTextContent(element: Element): string {
    if (!element || !element.textContent) {
        return undefined;
    }

    return element.textContent.toString();
}

function extractAnchorUrl(element: Element): URL {
    if (!element || !element.hasAttribute('href')) {
        return undefined;
    }

    return new URL(element.getAttribute('href'));
}

function removeNewline(input: string):string {
    return _.replace(input, /\r?\n|\r/g, '');
}

const parseDate = _.partial(moment, _, 'MMM. DD, YYYY hh:mma');

const sanitizeDate: (input: string) => Moment = _.flow(
    _.partial(maybe, _.isString),
    removeNewline, // TOOD: Move to input
    parseDate, // TODO: Move to input
);

const sanitizeNumber: (input: string) => number = _.flow(
    _.partial(maybe, _.isString),
    removeNewline,
    _.toNumber,
);


export {
    sanitizeDate,
    sanitizeNumber,
    extractAnchorUrl,
    extractTextContent,
    removeNewline,
}