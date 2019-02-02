import { URL } from 'url';
import {
    extractTextContent,
    extractAnchorUrl,
    removeNewline,
    parseDate,
    sanitizeDate,
    sanitizeNumber,
} from '../element-helpers';
import { Just, Nothing } from 'purify-ts/adts/Maybe';

describe('puppeteer element helpers', () => {

    describe('extractTextContent()', () => {
        // TODO: Convert to Property Test
        it('should extract text content from valid input', () => {
           const input = <Element>{ textContent: 'content' };
           const output = extractTextContent(input);
           expect(output).toBeJust(Just('content'));
        });

        // TODO: Convert to Property Test
        it('should return undefined from invalid input', () => {
            const input = <Element>{ };
            const output = extractTextContent(input);
            expect(output).toBeNothing();
        });

        // TODO: Convert to Property Test
        it('should return undefined for undefined input', () => {
            const output = extractTextContent(undefined);
            expect(output).toBeNothing();
        });
    });

    describe('extractAnchorUrl()', () => {
        it('should return the url for valid input', () => {
           const input = jest.fn<Element>(() => ({
               hasAttribute: jest.fn().mockReturnValueOnce(true),
               getAttribute: jest.fn().mockReturnValueOnce('http://aUrl'),
           }));
           const output = extractAnchorUrl(input());
           expect(output).toBeJust(Just(new URL('http://aUrl')));
        });

        it('should return the null for valid input, but invalid Url', () => {
            const input = jest.fn<Element>(() => ({
                hasAttribute: jest.fn().mockReturnValueOnce(true),
                getAttribute: jest.fn().mockReturnValueOnce('aUrl'),
            }));
            const output = extractAnchorUrl(input());
            expect(output).toBeNothing();
        });

        it('should return undefined when no href exists', () => {
           const input = jest.fn<Element>(() => ({
               hasAttribute: jest.fn().mockReturnValueOnce(false),
           }));
           const output = extractAnchorUrl(input());
            expect(output).toBeNothing();
        });

        it('should return undefined for undefined input', () => {
            const output = extractAnchorUrl(undefined);
            expect(output).toBeNothing();
        });
    });

    describe('removeNewline()', () => {
        it('should remove a newline from input', () => {
            const input = '\n';
            const output = removeNewline(Just(input));
            expect(output).toBeJust(Just(''));
        });

        it('should remove a carriage return from input', () => {
            const input = '\r';
            const output = removeNewline(Just(input));
            expect(output).toBeJust(Just(''));
        });

        it('should remove a carriage return and newline from input', () => {
            const input = '\r\n';
            const output = removeNewline(Just(input));
            expect(output).toBeJust(Just(''));
        });

        it('should remove all newlines from input', () => {
            const input = 'a\nb\nc';
            const output = removeNewline(Just(input));
            expect(output).toBeJust(Just('abc'));
        });

        it('should return empty string, when input is Nothing', () => {
            const output = removeNewline(Nothing);
            expect(output).toBeNothing();
        });
    });

    describe('parseDate()', () => {
        // TODO: Figure out how to test this, if at all
    });

    describe('sanitizeDate()', () => {
        // TODO: Figure out how to test this, if at all
    });

    describe('sanitizeNumber()', () => {
        // TODO: Figure out how to test this, if at all
    });
});