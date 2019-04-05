import R from 'ramda';
import { prettyObjToString, objToString, writeObjToDisk } from './fs-helpers';
import { Receipt } from '../entities';

const getPath = (receipt: Receipt): string => `${receipt.id}.json`;

const writeReceiptToDisk = (receipt: Receipt) =>
    writeObjToDisk(prettyObjToString, getPath(receipt), receipt);

const writeReceiptsToDisk = (receipts: Receipt[]) => Promise.all(R.map(writeReceiptToDisk, receipts));

export {
    getPath,
    writeReceiptToDisk,
    writeReceiptsToDisk,
};

export default writeReceiptsToDisk;