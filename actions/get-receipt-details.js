const _ = require('lodash');
const screenshots = require('../resources/screenshots');
const config = require('../resources/config');

module.exports = async function(page, url) {
	await page.goto(url.resolve(url.format()));
	await screenshots.save(page, `receipts-${url.get('receiptId')}`);

	// Get table of transactions totals / date
	const rawTransactions = await page.$$eval('.recall-table-set', (rowParts) =>
		Array.from(rowParts).map(row => {
			const dateElem = row.querySelector('.date-time');
			const amountElem = row.querySelector('.sold-col');
			const urlElem = row.querySelector('.view-col a');

			return {
				date: dateElem ? dateElem.innerText : null,
				amount: amountElem ? amountElem.innerText : null,
				url: urlElem ? urlElem.href : null,
			};
		})
	);

	const parsedReceipts = _.map(rawReceipts, rawReceipt => {

		let dateValue = null;
		let amountValue = null;
		let urlValue = null;

		try {
			let parsedDateValue = sanitizeDate(rawReceipt.date);
			if (parsedDateValue.isValid()) {
				dateValue = parsedDateValue;
			}
		} catch(e) {
			console.log(`Error parsing date: ${rawReceipt.date}`);
		}

		try {
			let parsedAmountValue = sanitizeNumber(rawReceipt.amount);
			if (!_.isNaN(parsedAmountValue)) {
				amountValue = parsedAmountValue;
			}
		} catch(e) {
			console.log(`Error parsing dollar amount: ${rawReceipt.amount}`);
		}

		try {
			if (_.isString(rawReceipt.url) && !_.isNull(rawReceipt.url)) {
				urlValue = url.parse(rawReceipt.url);
			}
		} catch(e) {
			console.log(`Error parsing url: ${rawReceipt.url}`);
		}

		return {
			dateTime: dateValue,
			value: amountValue,
			url: urlValue,
		};
	});

	const isReceiptNull = ({dateTime, value, url}) => _.isNull(dateTime) && _.isNull(url);

	return _.reject(parsedReceipts, isReceiptNull);
};
