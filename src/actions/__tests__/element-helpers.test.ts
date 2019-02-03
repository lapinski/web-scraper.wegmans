import { URL } from 'url';
import {
    extractTextContent,
    extractAnchorUrl,
    removeNewline,
    parseDate,
    sanitizeDate,
    sanitizeNumber,
} from '../element-helpers';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import { Moment } from 'moment';
import moment = require('moment');

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
        describe('When input is valid', () => {
            let output: Maybe<Moment>;
            beforeAll(() => {
                const input = 'Aug. 11, 2001 01:02 am';
                output = parseDate(Just(input));
            });

            it('should return something', () => {
               expect(output).not.toBeNothing();
            });

            it('should equal the expected date', () => {
                const value = output.extract();
                expect(value.month()).toEqual(7); // August == 7
                expect(value.date()).toEqual(11);
                expect(value.year()).toEqual(2001);
            });

            it('should return the correct time', () => {
                const value = output.extract();
                expect(value.hour()).toEqual(1);
                expect(value.minute()).toEqual(2);
            });
        });

        describe('When input is null', () => {
            let output: Maybe<Moment>;
            beforeAll(() => {
                output = parseDate(Nothing);
            });

            it('should return nothing', () => {
                expect(output).toBeNothing();
            });
        });

        describe('When input is invalid', () => {
            let output: Maybe<Moment>;
            beforeAll(() => {
                const invalidInput = 'AAA. 1231';
                output = parseDate(Just(invalidInput));
            });

            it('should return nothing', () => {
                expect(output).toBeNothing();
            });
        });
    });

    describe('sanitizeDate()', () => {
        describe('when given undefined', () => {
            let output: Maybe<Moment>;
            beforeAll(() => {
                output = sanitizeDate(undefined);
            });

            it('should return Nothing', () => {
               expect(output).toBeNothing();
            });
        });

        describe('when given a boolean', () => {
            let output: Maybe<Moment>;
            beforeAll(() => {
                output = sanitizeDate(true);
            });

            it('should return Nothing', () => {
                expect(output).toBeNothing();
            });
        });

        describe('when given a string with no newlines', () => {
            let output: Maybe<Moment>;
            beforeAll(() => {
                output = sanitizeDate('Aug. 11 2000 01:02am');
            });

            it('should return Just()', () => {
                expect(output).not.toBeNothing();
            });

            it('should return Just(Moment)', () => {
                const value = output.extract();
                expect(value).toBeInstanceOf(moment);
            });
        });

        describe('when given a string with newline', () => {
            let output: Maybe<Moment>;
            beforeAll(() => {
                output = sanitizeDate('Aug. 11 2000 01:02am\n');
            });

            it('should return Just()', () => {
                expect(output).not.toBeNothing();
            });

            it('should return Just(Moment)', () => {
                const value = output.extract();
                expect(value).toBeInstanceOf(moment);
            });

            it('should return a valid date', () => {
                const value = output.extract();
                expect(value.isValid()).toBeTruthy();
            });
        });
    });

    describe('sanitizeNumber()', () => {
        describe('when given undefined', () => {
            let output: Maybe<number>;
            beforeAll(() => {
                output = sanitizeNumber(undefined);
            });

            it('should return Nothing', () => {
                expect(output).toBeNothing();
            });
        });

        describe('when given a boolean', () => {
            let output: Maybe<number>;
            beforeAll(() => {
                output = sanitizeNumber(true);
            });

            it('should return Nothing', () => {
                expect(output).toBeNothing();
            });
        });

        describe('when given a string with no newlines', () => {
            let output: Maybe<number>;
            beforeAll(() => {
                output = sanitizeNumber('1.2');
            });

            it('should return Just()', () => {
                expect(output).not.toBeNothing();
            });

            it('should return Just(number)', () => {
                expect(output).toBeJust(Just(1.2));
            });
        });

        describe('when given a string with newline', () => {
            let output: Maybe<number>;
            beforeAll(() => {
                output = sanitizeNumber('1.2\n');
            });

            it('should return Just()', () => {
                expect(output).not.toBeNothing();
            });

            it('should return Just(number)', () => {
                expect(output).toBeJust(Just(1.2));
            });
        });
    });
});