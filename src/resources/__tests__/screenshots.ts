import * as screenshots from '../screenshots';

describe('Screenshots Module', () => {
    describe('getScreenshotdir', () => {
        it('combines valid strings', () => {
            const output = screenshots.getScreenshotDir('a', 'b');
            expect(output).toEqual('a/b');
        })
    })
});