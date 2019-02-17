import { PageObjectModel } from './page';

export interface ReceiptDetailPageObjectModel extends PageObjectModel {
    contentContainer: string;
    date: string;
    receiptInfo: {
        place: string;
        lane: string;
        operator: string;
    };
    transactionRow: string;
    transactionRowDetails: {
        quantity: string;
        productLink: string;
        upc: string;
        size: string;
        department: string;
        extendedPrice: string;
        savingsAmount: string;
    };
    totalAmounts: {
        totalSavings: string;
        tax: string;
        total: string;
    };
}

/**
 * Note: transactionRowDetails are relative to the 'transactionRow' selector
 */
export default <ReceiptDetailPageObjectModel>{
    contentContainer: '.receipts-summary',
    date: '.receipt-date-title',
    receiptInfo: {
        place: '.receipt-number-info .place',
        lane: '.receipt-number-info .lane',
        operator: '.receipt-number-info .operator',
    },
    transactionRow: '.recall-table-set:not(.header-table)',
    transactionRowDetails: {
        quantity: '.date-time label',
        productLink: '.product-col a',
        upc: '.product-col.ordernum',
        size: '.size-view .sold-col',
        department: '.department-view .sold-col',
        extendedPrice: '.price-view .sold-col .currency',
        savingsAmount: '.myreceipt-savings-row .save-price .currency',
    },
    totalAmounts: {
        totalSavings: '.myreceipt-total-list [ng-bind="summary.totalSaving"]',
        tax: '.myreceipt-total-list [ng-bind="summary.tax"]',
        total: '.myreceipt-total-list [ng-bind="summary.paymentAmount"]',
    },
};