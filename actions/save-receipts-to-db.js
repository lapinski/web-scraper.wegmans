const models = require('../resources/models');

module.exports = async function(receipts, storeName) {
  const storedReceipts = [];
  try {
    for (let i = 0, len = receipts.length; i < len; i++) {
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
