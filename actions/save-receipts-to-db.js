/* eslint-disable no-await-in-loop */
const models = require('../resources/models');

/**
 *
 * @param receipts
 * @param storeName
 * @returns {Promise<Array>}
 */
module.exports = async function saveReceiptsToDatabase(receipts, storeName) {
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
          url: receipt.url.format(),
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
