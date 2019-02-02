import { Maybe } from 'purify-ts/adts/Maybe';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeNothing(): Matchers<R>;
            toBeJust(expected: R): Matchers<R>;
        }
    }
}


expect.extend({
    toBeNothing<T>(received: Maybe<T>) {
        const pass = received.isNothing();

        if (pass) {
            return {
                message: () => `Expected ${received} to be Just(someValue) but it was Nothing`,
                pass: true,
            };
        } else {
            return {
                message: () =>`Expected ${received} to be Nothing`,
                pass: false,
            }
        }
    },
    toBeJust<T>(received: Maybe<T>, expected: Maybe<T>) {
        const pass = received.isJust() && received.extract() === expected.extract();

        if (pass) {
            return {
                message: () => `Expected ${received} to not equal ${expected}.`,
                pass: true,
            };
        } else {
            return {
                message: () => `Expected ${received} to be equal to ${expected}.`,
                pass: false,
            };
        }
    }
});