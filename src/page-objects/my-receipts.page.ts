import { PageObjectModel } from './page';

export interface MyReceiptsPageObjectModel extends PageObjectModel {
    receiptSummaryRows: string;
    receiptSummary: ReceiptSummaryRowSelectors;
}

export interface ReceiptSummaryRowSelectors {
    date: string;
    postalAddress: {
        street: string;
        town: string;
    };
    amount: string;
    url: string;
}

export default <MyReceiptsPageObjectModel>{
    path: '/my-receipts.html',
    receiptSummaryRows: '.myreceipt-table-body .recall-table-set:not(.total-row)',
    receiptSummary: {
        amount: '.sold-view .sold-col .currency',
        date: '.date-time label:not(.currency)',
        postalAddress: {
            street: '.product-recall .address',
            town: '.product-recall .company',
        },
        url: '.sold-view .view-col a',
    },
};