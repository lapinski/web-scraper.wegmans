import { PageObjectModel } from './page';

export interface ReceiptDetailPageObjectModel extends PageObjectModel {
    contentContainer: string;
    date: string;
}

export default <ReceiptDetailPageObjectModel>{
    contentContainer: '.receipts-summary',
    date: '.receipt-date-title'
};