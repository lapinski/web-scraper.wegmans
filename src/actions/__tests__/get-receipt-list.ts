jest.mock('../../resources/screenshots', () => ({
   save: jest.fn()
});

jest.mock('../../parsers/receipt-parser', () => ({
    parseMany: jest.fn()
}));

jest.mock('../../pages/my-receipts-page', () => ({
    MyReceiptsPage: jest.fn()
}))

describe('get-receipt-list action', () => {

    beforeAll(() => {

    });

    beforeEach(() => {

    });

    it('', () => {

    });
});