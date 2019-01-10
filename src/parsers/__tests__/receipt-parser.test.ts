import { expect } from 'chai';
import { Moment } from 'moment';
import * as receiptParser from '../receipt-parser';

describe('receipt parser', () => {
  describe('removeNewLine', () => {

    const positiveCases = [
      {in: null, out: ''},
      {in:'\n', out:''},
      {in:'\r', out:''},
      {in:'\r\n', out: ''},
      {in:'\n\r', out: ''},
      {in:'a\nb', out: 'ab'},
      {in:'a\rb', out: 'ab'},
      {in:'a\n\rb', out: 'ab'},
    ];

    for(let i = 0, len = positiveCases.length; i < len; i++) {
      const testCase = positiveCases[i];
      describe(`when given '${testCase.in}' input`, () => {
        let output:any;
        beforeEach(() => {
          output = receiptParser.removeNewline(testCase.in);
        });

        it(`should return '${testCase.out}'`, () => {
          expect(output).to.equal(testCase.out);
        });
      });
    }

  });

  describe('maybe', () => {
    const identity = (i:string) => i
    const inverse = (i:string):string|undefined => undefined;

    const testCases:{in:string, out: string|null, f:(i:string)=>string|undefined}[] = [
      {in: null, out: undefined, f: identity},
      {in: 'value', out: 'value', f: identity},
      {in: 'value', out: undefined, f: inverse},
      {in: null, out: undefined, f: inverse},
    ];

    for(let i = 0, len = testCases.length; i < len; i++) {
      const testCase = testCases[i];
      describe(`when given the input value '${testCase.in}' and '${testCase.f}' as the test function`, () => {
        it(`should return '${testCase.out}'`, () => {
          const output = receiptParser.maybe(testCase.f, testCase.in);
          expect(output).to.equal(testCase.out);
        });
      });
    }
  });

  describe('parseDate', () => {
    const testCases:{in:string, out:Moment | null}[] = [
      {in: null, out: null}, // Null Input
      {in: '', out: null}, // Empty String
      {in: 'something-random', out: null}, // Malformed Date
      {in: 'Jan. 32, 2020 10:20pm', out: null}, // Valid Date Format (invalid actual date)
      {in: 'Jan. 31, 2018 10:00pm', out: null}, // Valid Date
    ]
  });

  describe('sanitizeDate', () => {

  });

  describe('sanitizeNumber', () => {

  });

  describe('isReceiptNull', () => {

  });

  describe('parseOne', () => {

  });

  describe('parseMany', () => {

  });
});