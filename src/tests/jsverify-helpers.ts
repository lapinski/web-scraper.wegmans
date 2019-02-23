import * as jsc from 'jsverify';

/**
 * wrapper function for using jsverify with jest syntax
 *
 * @param description string describing the test
 * @param arbitrary a jsverify record (or other arbitrary)
 * @param testFn function that expects, in proper jest syntax
 * @param opts options for jsverify
 */
export function itHolds<A>(
    description: string,
    arbitrary: jsc.ArbitraryLike<A>,
    testFn: (val: A) => void,
    options: jsc.Options = {},
) {
    it(description, () => {
        jsc.assert(jsc.forall(arbitrary, (val: A) => {
            testFn(val);

            return true;
        }), options);
    });
}