import R from 'ramda';
import { prettyObjToString, objToString, writeObjToDisk } from './fs-helpers';
import { ReceiptSummary } from './get-receipt-summary-list';
import * as path from 'path';
import { Either } from 'purify-ts/adts/Either';

const getPath = (receipt: ReceiptSummary): string =>
    path.join('data', `${receipt.date.format('MMDDYYYY_HHMMa')}.json`)
;

const writeReceiptToDisk = (receipt: ReceiptSummary) =>
    writeObjToDisk(prettyObjToString, getPath(receipt), receipt);

const writeReceiptsToDisk = (receipts: ReceiptSummary[]): Promise<Either<Error, string>[]> => Promise.all(R.map(writeReceiptToDisk, receipts));

export {
    getPath,
    writeReceiptToDisk,
    writeReceiptsToDisk,
};

export default writeReceiptsToDisk;