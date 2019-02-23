import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import cheerio from 'cheerio';
import moment, { Moment } from 'moment';
import {
    extractDate,
    extractFloat,
    extractHref,
    extractText,
    parseDate,
    parseText,
    removeNewline,
} from '../element-helpers';

describe.skip('puppeteer element helpers', () => {

    describe('extractDate()', () => {
        describe('when given valid input', () => {
            it('should return a valid date', () => {
                const input = cheerio.load('<div>Aug. 20, 2000 10:23am');
                const output = extractDate('div', input.root());

                expect(output.isJust()).toEqual(true);

                expect(output.extract()
                    .isSame(moment({
                        year: 2000,
                        month: 7,
                        day: 20,
                        hour: 10,
                        minute: 23,
                    }))
                ).toBe(true);
            });
        });

        describe('when given null input', () => {
            it('should return a Nothing', () => {
                const input = cheerio.load('');
                const output = extractDate('div', input.root());

                expect(output).toBeNothing();
            });
        });

        describe('when given an invalid date', () => {
            it('should return a Nothing', () => {
                const input = cheerio.load('<div>Junk Date</div>');
                const output = extractDate('div', input.root());

                expect(output).toBeNothing();
            });
        });
    });

    describe('extractFloat()', () => {

        const validContext = cheerio.load('<div>0.123</div>');
        const invalidContext = cheerio.load('<div>Junk Data</div>');

        describe('when given undefined selector and context', () => {
            it('should return Nothing', () => {
                const output = extractFloat(undefined, undefined);
                expect(output).toBeNothing();
            });
        });

        describe('when given undefined selector and valid context', () => {
            it('should return Nothing', () => {
                const output = extractFloat(undefined, validContext.root());
                expect(output).toBeNothing();
            });
        });

        describe('when given a valid selector and undefined context', () => {
            it('should return Nothing', () => {
                const output = extractFloat('div', undefined);
                expect(output).toBeNothing();
            });
        });

        describe('when given valid inputs', () => {
            let output: Maybe<number>;
            beforeAll(() => {
                output = extractFloat('div', validContext.root());
            });

            it('should return Just()', () => {
                expect(output).not.toBeNothing();
            });

            it('should return Just(number)', () => {
                expect(output).toBeJust(Just(0.123));
            });
        });

        describe('when given valid inputs  with newline', () => {
            let output: Maybe<number>;
            beforeAll(() => {
                const inputWithNewlines = cheerio.load('<div>\n 0.123</div>');
                output = extractFloat('div', inputWithNewlines.root());
            });

            it('should return Just()', () => {
                expect(output).not.toBeNothing();
            });

            it('should return Just(number)', () => {
                expect(output).toBeJust(Just(0.123));
            });
        });

        describe('when given valid context and invalid selector', () => {
           it('should return nothing', () => {
              const output = extractFloat('junk', validContext.root());
              expect(output).toBeNothing();
           });
        });

        describe('when given invalid inputs', () => {
           it('should return nothing', () => {
              const output = extractFloat('div', invalidContext.root());
              expect(output).toBeNothing();
           });
        });
    });

    describe('extractHref()', () => {
        const validContext = cheerio.load('<a href="https://www.site.com">Link</a>');
        const invalidContext = cheerio.load('<a>Junk</a>');

        describe('when given valid selector and context', () => {
           it('should return a valid url', () => {
               const output = extractHref('a', validContext.root());
               expect(output).toBeJust(Just('https://www.site.com'));
           });
        });

        describe('when given an invalid selector and valid context', () => {
            it('should return Nothing', () => {
                const output = extractHref('junk', validContext.root());
                expect(output).toBeNothing();
            });
        });

        describe('when given an invalid selector and valid context', () => {
            it('should return Nothing', () => {
                const output = extractHref('junk', cheerio.load('').root());
                expect(output).toBeNothing();
            });
        });

        describe('when given a valid selector and invalid context', () => {
            it('should return Nothing', () => {
                const output = extractHref('a', invalidContext.root());
                expect(output).toBeNothing();
            });
        });

        describe('when given an undefined selector and valid context', () => {
            it('should return Nothing', () => {
                const output = extractHref(undefined, validContext.root());
                expect(output).toBeNothing();
            });
        });

        describe('when given a valid selector and undefined context', () => {
            it('should return Nothing', () => {
                const output = extractHref('a', undefined);
                expect(output).toBeNothing();
            });
        });

        describe('when given undefined inputs', () => {
            it('should return Nothing', () => {
                const output = extractHref(undefined, undefined);
                expect(output).toBeNothing();
            });
        });
    });

    describe('extractText()', () => {
        // TODO: Convert to Property Test
        it('should extract text content from valid input', () => {
            const input = cheerio.load('<div>content</div>');
            const output = extractText('div', input.root());
            expect(output).toBeJust(Just('content'));
        });

        // TODO: Convert to Property Test
        it('should return undefined from invalid input', () => {
            const input = cheerio.load('');
            const output = extractText('div', input.root());
            expect(output).toBeNothing();
        });

        // TODO: Convert to Property Test
        it('should return undefined for undefined input', () => {
            const output = extractText(undefined, undefined);
            expect(output).toBeNothing();
        });
    });

    describe('parseDate()', () => {
        describe('When input is valid', () => {
            let output: Maybe<Moment>;
            beforeAll(() => {
                const input = 'Aug. 11, 2001 01:02am';
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
            it('should return nothing', () => {
                const output = parseDate(Nothing);
                expect(output).toBeNothing();
            });
        });

        describe('When input is invalid', () => {
            it('should return nothing', () => {
                const invalidInput = 'AAA. 1231';
                const output = parseDate(Just(invalidInput));
                expect(output).toBeNothing();
            });
        });
    });

    describe('parseText()', () => {
        // TODO: Convert to Property Test
        it('should extract text content from valid input', () => {
            const input = cheerio.load('<div>content</div>');
            const output = parseText('div', input.root());
            expect(output).toBeJust(Just('content'));
        });

        // TODO: Convert to Property Test
        it('should return Nothing from invalid input (no text on element)', () => {
            const input = cheerio.load('');
            const output = parseText('div', input.root());
            expect(output).toBeNothing();
        });

        // TODO: Convert to Property Test
        it('should return Nothing for undefined input (selector)', () => {
            const input = cheerio.load('<div>content</div>');
            const output = parseText(undefined, input.root());
            expect(output).toBeNothing();
        });

        it('should return undefined for undefined input (context)', () => {
            const output = parseText('div', undefined);
            expect(output).toBeNothing();
        });

        it('should return undefined for undefined input (both)', () => {
            const output = parseText(undefined, undefined);
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
});