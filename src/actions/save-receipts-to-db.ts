/* eslint-disable no-await-in-loop */
import models from '../resources/models';
import { Receipt } from '../types/receipt';

export default async function saveReceiptsToDatabase(receipts: ReadonlyArray<Receipt>, storeName: string) {
  const storedReceipts = [];
  try {
    for (let i = 0, len = receipts.length; i < len; i += 1) {
      const receipt = receipts[i];

      const existingReceipt = await models.Receipt.findOne({
        where: {
          date: receipt.dateTime,
        },
      });

      if (!existingReceipt) {
        const newReceipt = await models.Receipt.create({
          date: receipt.dateTime,
          amount: receipt.value,
          url: receipt.url.toString(),
          store: storeName,
        });
        const savedReceipt = await newReceipt.save();
        storedReceipts.push(savedReceipt.get({ plain: true }));
      } else {
        storedReceipts.push(existingReceipt.get({ plain: true }));
      }
    }
  } catch (e) {
    throw new Error(`Error saving receipts: ${e.message}`);
  }
  return storedReceipts;
};
