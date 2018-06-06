const signIn = require('./sign-in');
const getReceiptList = require('./get-receipt-list');

/**
 *
 * @type {{signIn: (*|(function(): page))}}
 */
module.exports = {
    signIn,
    getReceiptList,
};
