import { Just, Nothing } from 'purify-ts/adts/Maybe';
import cheerio from 'cheerio';
import {
    extractDate,
    extractFloat,
    extractHref,
    extractText,
    parseDate,
    parseText,
    removeNewline,
} from '../element-helpers';

describe('puppeteer element helpers', () => {

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

    /*
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
    });*/
});