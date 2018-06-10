const models = require('../resources/models');

module.exports = async function (receipts, storeName) {
	try {
		for(let i = 0, len = receipts.length; i < len; i++) {
			const receipt = receipts[i];

			const existingReceipt = await models.Receipt.findOne({
				where: {
					date: receipt.dateTime
				}
			});

			if (!existingReceipt) {
				const newReceipt = await models.Receipt.create({
					date: receipt.dateTime,
					amount: receipt.value,
					url: receipt.url.format(),
					store: storeName,
				});
				await newReceipt.save();
			}
		}
	} catch (e) {
		throw new Error(`Error saving receipts: ${e.message}`);
	}
};
