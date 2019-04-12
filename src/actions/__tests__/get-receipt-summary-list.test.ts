import moment from 'moment';
import cheerio from 'cheerio';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import getReceiptSummaryList, {
    extractReceiptSummaryFromMaybe,
    extractReceiptSummaryFromRow,
    isValidReceiptSummary, parseMyReceiptsPage,
    parseRows,
    ReceiptSummary,
    SanitizedReceiptSummary,
} from '../get-receipt-summary-list';
import { MyReceiptsPageObjectModel, ReceiptSummaryRowSelectors } from '../../page-objects/my-receipts.page';
import { ActionResponse } from '../types';
import puppeteer, { Page } from 'puppeteer';

describe('get-receipt-list action', () => {

    const startDate = new Date();
    const endDate = new Date();

    const aValidSanitizedReceiptSummary = <SanitizedReceiptSummary>{
        date: Just(moment()),
        postalAddress: {
            street: Just('aStreet'),
            town: Just('aTown'),
        },
        amount: Just(1),
        url: Just('anUrl'),
    };

    const anHtmlReceiptSummary = '<div>' +
        '<div class="amount">1234.5</div>' +
        '<div class="date">Jan. 02, 1234 01:02am</div>' +
        '<div class="street">1234 Main St.</div>' +
        '<div class="town">Some Town</div>' +
        '<a class="url" href="https://some.url">https://some.url</a>' +
    '</div>';

    const rowPOM = <ReceiptSummaryRowSelectors>{
        amount: '.amount',
        date: '.date',
        postalAddress: {
            street: '.street',
            town: '.town'
        },
        url: '.url',
    };

    const pom = <MyReceiptsPageObjectModel>{
        path: 'my-receipts-page',
        receiptSummaryRows: '.row',
        receiptSummary: rowPOM,
    };

    describe('extractReceiptSummaryFromMaybe()', () => {
        describe('when given valid inputs', () => {
            let output: ReceiptSummary;

            beforeAll(() => {
                output = extractReceiptSummaryFromMaybe(aValidSanitizedReceiptSummary);
            });

            it('should have a date property', () => {
                const expectedValue = aValidSanitizedReceiptSummary.date.extract();
                expect(output)
                    .toHaveProperty('date', expectedValue);
            });

            it('should have a postalAddress property', () => {
                expect(output).toHaveProperty('postalAddress');
                expect(output.postalAddress).toBeTruthy();
            });

            it('should have a postalAddress.street property', () => {
                const expectedValue = aValidSanitizedReceiptSummary
                    .postalAddress
                    .street
                    .extract();

                expect(output.postalAddress)
                    .toHaveProperty('street', expectedValue);
            });

            it('should have a postalAddress.town property', () => {
                const expectedValue = aValidSanitizedReceiptSummary
                    .postalAddress
                    .town
                    .extract();

                expect(output.postalAddress)
                    .toHaveProperty('town', expectedValue);
            });

            it('should have a amount property', () => {
                const expectedValue = aValidSanitizedReceiptSummary.amount.extract();
                expect(output)
                    .toHaveProperty('amount', expectedValue);
            });

            it('should have a url property', () => {
                const expectedValue = aValidSanitizedReceiptSummary.url.extract();
                expect(output)
                    .toHaveProperty('url', expectedValue);
            });
        });

        describe('when given invalid inputs', () => {

            describe('when given a \'Nothing\' date property', () => {
                it('should have the date property as undefined', () => {
                const input = <SanitizedReceiptSummary>{
                    ...aValidSanitizedReceiptSummary,

                    date: Nothing,
                };
                const output = extractReceiptSummaryFromMaybe(input);

                expect(output).toBeTruthy();
                expect(output).toHaveProperty('date', undefined);
                });
            });

            describe('when given a missing date property', () => {
                it('should have the date property as undefined', () => {
                    const input = <SanitizedReceiptSummary>{
                        ...aValidSanitizedReceiptSummary,

                        date: undefined,
                    };
                    const output = extractReceiptSummaryFromMaybe(input);

                    expect(output).toBeTruthy();
                    expect(output).toHaveProperty('date', undefined);
                });
            });

            // Test Invalid Address (missing Prop)
            describe('when given a missing postalAddress property', () => {
                it('should have the stub property obj with undefined value for street', () => {
                    const input = <SanitizedReceiptSummary>{
                        ...aValidSanitizedReceiptSummary,

                        postalAddress: undefined,
                    };
                    const output = extractReceiptSummaryFromMaybe(input);

                    expect(output).toBeTruthy();
                    expect(output).toHaveProperty('postalAddress');

                    expect(output.postalAddress).toHaveProperty('street', undefined);
                });

                it('should have the stub postalAddress obj, with undefined value for town', () => {
                    const input = <SanitizedReceiptSummary>{
                        ...aValidSanitizedReceiptSummary,

                        postalAddress: undefined,
                    };
                    const output = extractReceiptSummaryFromMaybe(input);

                    expect(output).toBeTruthy();
                    expect(output).toHaveProperty('postalAddress');

                    expect(output.postalAddress).toHaveProperty('town', undefined);
                });
            });

            // Test Invalid Address.Street (missing Prop)
            describe('when given a undefined postalAddress.street property', () => {
                it('should have the postalAddress.street property as undefined', () => {
                    const input = <SanitizedReceiptSummary>{
                        ...aValidSanitizedReceiptSummary,

                        postalAddress: {
                            street: undefined,
                            town: Just('aTown'),
                        }
                    };
                    const output = extractReceiptSummaryFromMaybe(input);

                    expect(output).toBeTruthy();
                    expect(output).toHaveProperty('postalAddress');


                    expect(output.postalAddress).toHaveProperty('street', undefined);
                    expect(output.postalAddress).toHaveProperty('town', 'aTown');
                });
            });

            // Test Invalid Address.Town (missing Prop)
            describe('when given a missing postalAddress.town property', () => {
                it('should have the property as undefined', () => {
                    const input = <SanitizedReceiptSummary>{
                        ...aValidSanitizedReceiptSummary,

                        postalAddress: {
                            street: Just('aStreet'),
                            town: undefined,
                        }
                    };
                    const output = extractReceiptSummaryFromMaybe(input);

                    expect(output).toBeTruthy();
                    expect(output).toHaveProperty('postalAddress');

                    expect(output.postalAddress).toHaveProperty('street', 'aStreet');
                    expect(output.postalAddress).toHaveProperty('town', undefined);
                });
            });

            // Test Invalid Amount (missing Prop)
            describe('when given a missing amount property', () => {
                it('should have the property as undefined', () => {
                    const input = <SanitizedReceiptSummary>{
                        ...aValidSanitizedReceiptSummary,

                        amount: undefined,
                    };
                    const output = extractReceiptSummaryFromMaybe(input);

                    expect(output).toBeTruthy();
                    expect(output).toHaveProperty('amount', undefined);
                });
            });

            // Test Invalid Url (missing Prop)
            describe('when given a missing url property', () => {
                it('should have the property as undefined', () => {
                    const input = <SanitizedReceiptSummary>{
                        ...aValidSanitizedReceiptSummary,

                        url: undefined,
                    };
                    const output = extractReceiptSummaryFromMaybe(input);

                    expect(output).toBeTruthy();
                    expect(output).toHaveProperty('url', undefined);
                });
            });
        });
    });

    describe('extractReceiptSummaryFromRow()', () => {
        describe('when given valid inputs', () => {
            let output: SanitizedReceiptSummary;
            beforeAll(() => {
                const doc = cheerio.load(anHtmlReceiptSummary);
                const input = doc('div');

                output = extractReceiptSummaryFromRow(rowPOM, input);
            });

            it('should return a valid object', () => {
                expect(output).not.toBeNull();
                expect(output).not.toBeUndefined();
            });

            it('should return an object with the expected amount', () => {
                expect(output.amount).toBeJust(Just(1234.5));
            });

            it('should return an object with the expected date', () => {
                expect(output.date).not.toBeNothing();
                expect(output.date.extract().valueOf())
                    .toBe(moment('1234-01-02 01:02').valueOf());
            });

            it('should return an object with a valid postalAddress obj', () => {
                expect(output.postalAddress).not.toBeNull();
                expect(output.postalAddress).not.toBeUndefined();
            });

            it('should return an object with the expected street', () => {
                expect(output.postalAddress.street).toBeJust(Just('1234 Main St.'));
            });

            it('should return an object with the expected town', () => {
                expect(output.postalAddress.town).toBeJust(Just('Some Town'));
            });

            it('should return an object with the expected url', () => {
                expect(output.url).toBeJust(Just('https://some.url'));
            });
        });
    });

    describe('getReceiptSummaryList()', () => {
        describe('When given valid inputs', () => {
            let stubInputPage: Page;
            let output: ActionResponse<ReceiptSummary[]>;
            beforeAll(() => {
                const baseUrl = 'http:/some.url';
                stubInputPage = <Page>{
                    goto: (url, opts) => Promise.resolve(<puppeteer.Response>{}),
                    content: () =>
                        Promise.resolve('<div>' +
                            anHtmlReceiptSummary +
                        '</div>'),
                    type: (selector: string, value: string) => Promise.resolve(),
                };

                return getReceiptSummaryList(baseUrl, pom, startDate, endDate, stubInputPage)
                    .then(response => {
                        output = response;
                    });
            });

            it('should return the same input page', () => {
                expect(output.page).toBe(stubInputPage);
            });
        });

        // TODO: Fleshout other test cases
    });

    describe('isValidReceiptSummary()', () => {
        it('should return true for valid inputs', () => {
            const output = isValidReceiptSummary(aValidSanitizedReceiptSummary);
            expect(output).toBe(true);
        });

        it('should return false for invalid obj', () => {
            const input = <SanitizedReceiptSummary>undefined;
            const output = isValidReceiptSummary(input);

            expect(output).toBe(false);
        });

        it('should return false for invalid date', () => {
            // TODO
        });

        it('should return false for invalid street', () => {
            // TODO
        });

        it('should return false for invalid town', () => {
            // TODO
        });

        it('should return false for invalid amount', () => {
            // TODO
        });

        it('should return false for invalid url', () => {
            // TODO
        });
    });

    describe('parseMyReceiptsPage()', () => {
        // TODO: Create A Stub Page that returns expected HTML

        describe('when given valid inputs', () => {
            let stubPage: Page;
            let output: ActionResponse<ReceiptSummary[]>;

            beforeAll(() => {
            stubPage = <Page>{
                content: () => Promise.resolve('<div class="row">' + anHtmlReceiptSummary + '</div>')
            };

            parseMyReceiptsPage(pom, stubPage)
                .then(response => {
                    output = response;
                });
            });

            it('should return the same page as input', () => {
                expect(output.page).toBe(stubPage);
            });

            it('should return a Just value', () => {
                expect(output.result.isJust()).toBe(true);
            });

            it('should return a single row', () => {
                expect(output.result.extract()).toHaveLength(1);
            });
        });

    });

    describe('parseRows()', () => {
        describe('Positive Use Case', () => {
            const inputHtml = '<div>' +
                    '<div class="row">' +
                        anHtmlReceiptSummary +
                    '</div>';
                '</div>';
            let output: Maybe<ReceiptSummary[]>;

            beforeAll(() => {
                const inputDoc = cheerio.load(inputHtml);
                const input = inputDoc('.row');
                output = parseRows(rowPOM, input);
            });

            it('should return a just value', () => {
                expect(output.isJust()).toBe(true);
            });

            it('should return a single record', () => {
                const value = output.extract();
                expect(value).toHaveLength(1);
            });
        });

        describe('when some of input is invalid', () => {
            const inputHtml = '<div>' +
                '<div class="row">' +
                anHtmlReceiptSummary +
                '</div>' +
                '<div class="row">' +
                anHtmlReceiptSummary +
                '</div>' +
                '<div class="row">Something Else</div>';
            '</div>';
            let output: Maybe<ReceiptSummary[]>;

            beforeAll(() => {
                const inputDoc = cheerio.load(inputHtml);
                const input = inputDoc('.row');
                output = parseRows(rowPOM, input);
            });

            it('should return a just value', () => {
                expect(output.isJust()).toBe(true);
            });

            it('should return a single record', () => {
                const value = output.extract();
                expect(value).toHaveLength(2);
            });
        });

        describe('when input has no rows, but is valid html', () => {
            const inputHtml = '<div></div>';
            let output: Maybe<ReceiptSummary[]>;

            beforeAll(() => {
                const inputDoc = cheerio.load(inputHtml);
                const input = inputDoc('.row');
                output = parseRows(rowPOM, input);
            });

            it('should return a just value', () => {
                expect(output.isJust()).toBe(true);
            });

            it('should return an array with no elements', () => {
                expect(output.extract()).toHaveLength(0);
            });
        });

        describe('when input is undefined', () => {
            let output: Maybe<ReceiptSummary[]>;

            beforeAll(() => {
                output = parseRows(rowPOM, undefined);
            });

            it('should return a just value', () => {
                expect(output.isNothing()).toBe(true);
            });
        });
    });
});