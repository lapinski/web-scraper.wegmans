import { Maybe } from 'purify-ts/adts/Maybe';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeNothing(): Matchers<R>;
            toBeJust(expected: R): Matchers<R>;
            toBeJust(expected: R, using: (actual: R, expected: R) => boolean): Matchers<R>;
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
                message: () => `Expected ${received} to be Nothing`,
                pass: false,
            };
        }
    },
    toBeJust<T>(received: Maybe<T>, expected: Maybe<T>, using: (actual: Maybe<T>, expected: Maybe<T>) => boolean = undefined) {
        const equals = using ? using : this.equals;

        const areBothJust = received.isJust() && expected.isJust();
        const areEqual = equals(received.extract(), expected.extract());
        const pass = areBothJust && areEqual;

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
    },
});