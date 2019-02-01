import jsc from 'jsverify';
import * as screenshots from '../screenshots';


describe('Screenshots Module', () => {
    describe('getScreenshotdir', () => {
        it('combines valid strings', () => {
            const output = screenshots.getScreenshotDir('a', 'b');
            expect(output).toEqual('a/b');
        })

        it('property test getScreenshotDir', () => {
            expect(jsc.forall(jsc.string, jsc.string, (a, b) =>
                `${a}/${b}` === screenshots.getScreenshotDir(a, b)
            )).toBeTruthy();
        });
    })
});