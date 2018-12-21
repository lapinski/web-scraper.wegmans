import { expect } from 'chai';
import * as receiptParser from '../../src/parsers/receipt-parser';

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

  });

  describe('parseDate', () => {

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