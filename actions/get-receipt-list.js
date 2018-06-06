const screenshots = require('../resources/screenshots');
const config = require('../resources/config');

module.exports = async function(page) {
	await page.goto(`${config.baseUrl}/my-receipts.html`);
	await screenshots.save(page, 'receipts');

	// Get table of receipt totals / date
	const receipts = await page.$$eval('.recall-table-set', (rowParts) =>
		Array.from(rowParts).map(row => {
			const dateElem = row.querySelector('.date-time');
			const valueElem = row.querySelector('.sold-col');
			const urlElem = row.querySelector('.view-col a');

			return {
				dateTime: dateElem ? dateElem.innerText : null,
				value: valueElem ? valueElem.innerText: null,
				url: urlElem ? urlElem.href : null,
			};
		})
	);

	return receipts;
};
