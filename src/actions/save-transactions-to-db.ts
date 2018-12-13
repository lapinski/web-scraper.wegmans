/* eslint-disable no-await-in-loop */
import models from '../resources/models';
import { Transaction } from '../types/receipt';

export default async function saveTransactionsToDb(transactions:ReadonlyArray<Transaction>, receiptId:number) {
  const storedTransactions = [];
  try {
    for (let i = 0, len = transactions.length; i < len; i += 1) {
      const transaction = transactions[i];

      const existingTransaction = await models.Transaction.findOne({
        where: {
          productCode: transaction.productCode,
          receiptId,
          // TODO: Find better matching criteria
        },
      });

      if (!existingTransaction) {
        const newTransaction = await models.Transaction.create({
          quantity: transaction.quantity,
          productName: transaction.productName,
          productUrl: transaction.productUrl,
          productCode: transaction.productCode,
          amount: transaction.amount,
          discount: transaction.discount,
          receiptId,
        });
        const storedTransaction = await newTransaction.save();
        storedTransactions.push(storedTransaction.get({ plain: true }));
      } else {
        storedTransactions.push(existingTransaction.get({ plain: true }));
      }
    }
  } catch (e) {
    throw new Error(`Error saving receipts: ${e.message}`);
  }
};
