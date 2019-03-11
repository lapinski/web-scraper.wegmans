import moment from 'moment';
import {
    extractReceiptSummaryFromMaybe,
    isValidReceiptSummary,
    ReceiptSummary,
    SanitizedReceiptSummary,
} from '../get-receipt-summary-list';
import { Just, Nothing } from 'purify-ts/adts/Maybe';

describe('get-receipt-list action', () => {

    const aValidSanitizedReceiptSummary = <SanitizedReceiptSummary>{
        date: Just(moment()),
        postalAddress: {
            street: Just('aStreet'),
            town: Just('aTown'),
        },
        amount: Just(1),
        url: Just('anUrl'),
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
            beforeAll(() => {

            });
        });

        describe('when given invalid inputs', () => {

        });
    });

    describe('getReceiptSummaryList()', () => {

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

        });

        it('should return false for invalid street', () => {

        });

        it('should return false for invalid town', () => {

        });

        it('should return false for invalid amount', () => {

        });

        it('should return false for invalid url', () => {

        });
    });

    describe('parseMyReceiptsPage()', () => {

    });

    describe('parseRows()', () => {

    });
});