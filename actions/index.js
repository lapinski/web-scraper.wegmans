const signIn = require('./sign-in');
const getReceiptList = require('./get-receipt-list');
const getReceiptTransactions = require('./get-receipt-transactions');
const saveReceiptsToDb = require('./save-receipts-to-db');

/**
 *
 * @type {{signIn: (*|(function(): page))}}
 */
module.exports = {
    getReceiptList,
    getReceiptTransactions,
    saveReceiptsToDb,
    signIn,
};
