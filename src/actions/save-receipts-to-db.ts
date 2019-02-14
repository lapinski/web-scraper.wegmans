/* eslint-disable no-await-in-loop */
import { Receipt } from '../entities/Receipt';
import { getRepository } from '../resources/database';

export default async function saveReceiptsToDatabase(receipts: any[], storeName: string): Promise<Array<Receipt>> {
  const receiptRepo = await getRepository(Receipt);
  const storedReceipts: Array<Receipt> = [];
  try {
    for (let i = 0, len = receipts.length; i < len; i += 1) {
    const receipt = receipts[i];

    const existingReceipt = await receiptRepo.findOne({
        where: {
        date: receipt.dateTime,
        },
    });

    if (!existingReceipt) {
        const newReceipt = new Receipt();
        newReceipt.date = receipt.dateTime.toDate();
        newReceipt.amount = receipt.value;
        newReceipt.url = receipt.url.toString();
        newReceipt.store = storeName;

        const savedReceipt = await receiptRepo.save(newReceipt);
        storedReceipts.push(savedReceipt);
    } else {
        storedReceipts.push(existingReceipt);
    }
    }
  } catch (e) {
    throw new Error(`Error saving receipts: ${e.message}`);
  }
  return storedReceipts;
}
