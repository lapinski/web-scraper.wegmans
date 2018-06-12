const screenshots = require('../resources/screenshots');

module.exports = async function(page, url) {
  await page.goto(url);
  await screenshots.save(page, `receipts-${url.query}`);

  // Get table of transactions totals / date
  const rawTransactions = await page.$$eval('.recall-table-set', rowParts =>
    Array.from(rowParts).map(row => {
      const quantityElem = row.querySelector('.date-time');
      const productElem = row.querySelector('.product-col a');
      const productCodeElem = row.querySelector('.product-col.ordernum');
      const amountElem = row.querySelector('.price-view');
      const discountElem = row.querySelector(
        '.myreceipt-savings-row .save-price',
      );

      return {
        quantity: quantityElem ? quantityElem.innerText : null,
        productName: productElem ? productElem.innerText : null,
        productUrl: productElem ? productElem.href : null,
        productCode: productCodeElem ? productCodeElem.innerText : null,
        amount: amountElem ? amountElem.innerText : null,
        discount: discountElem ? discountElem.innerText : null,
      };
    }),
  );

  // TODO: Parse Transactions
  return rawTransactions;
};
