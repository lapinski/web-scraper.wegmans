import R from 'ramda';
import { prettyObjToString, objToString, writeObjToDisk } from './fs-helpers';
import { Transaction } from '../entities';

const getPath = (transaction: Transaction): string => `${transaction.id}.json`;

const writeTransactionToDisk = (transaction: Transaction) =>
    writeObjToDisk(prettyObjToString, getPath(transaction), transaction);

const writeTransactionsToDisk = (transactions: Transaction[]) => Promise.all(R.map(writeTransactionToDisk, transactions));

export {
    getPath,
    writeTransactionToDisk,
    writeTransactionsToDisk,
};

export default writeTransactionsToDisk;