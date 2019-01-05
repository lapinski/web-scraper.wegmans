/* eslint-disable no-await-in-loop */
import { RawTransaction } from '../types/receipt';
import Transaction from '../entities/Transaction';
import { getRepository } from '../resources/database';
import Receipt from '../entities/receipt';

export default async function saveTransactionsToDb(transactions: ReadonlyArray<RawTransaction>, receipt: Receipt) {
  const transactionRepo = await getRepository(Transaction);
  const storedTransactions = [];
  try {
    for (let i = 0, len = transactions.length; i < len; i += 1) {
      const transaction = transactions[i];

      const existingTransaction = await transactionRepo.find({
        where: {
          productCode: transaction.productCode,
          receipt: receipt,
          // TODO: Find better matching criteria
        },
      });

      if (!existingTransaction) {
        const newTransaction = new Transaction();
        newTransaction.quantity = parseInt(transaction.quantity, 10);
        newTransaction.productName = transaction.productName;
        newTransaction.productUrl = transaction.productUrl;
        newTransaction.productCode = transaction.productCode;
        newTransaction.amount = transaction.amount;
        newTransaction.discountAmount = parseFloat(transaction.discount);
        newTransaction.receipt  = receipt;
        const storedTransaction = await transactionRepo.save(newTransaction);
        storedTransactions.push(storedTransaction);
      } else {
        storedTransactions.push(existingTransaction);
      }
    }
  } catch (e) {
    throw new Error(`Error saving receipts: ${e.message}`);
  }
}
