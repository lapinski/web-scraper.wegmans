import { expect } from 'chai';
import * as receiptParser from '../../src/parsers/receipt-parser';

describe('receipt parser', () => {
  describe('removeNewLine', () => {

    describe('when given null input', () => {
      let output:any;
      beforeEach(() => {
        output = receiptParser.removeNewline(null);
      });

      it('should return null', () => {
        expect(output).to.equal('');
      });
    });
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