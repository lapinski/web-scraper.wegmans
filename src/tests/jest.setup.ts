import { Maybe } from 'purify-ts/adts/Maybe';
import { Either } from 'purify-ts/adts/Either';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeNothing(): Matchers<R>;
            toBeJust(expected: R): Matchers<R>;
            toBeJust(expected: R, using: (actual: R, expected: R) => boolean): Matchers<R>;

            toBeRight(expected: R): Matchers<R>;
            toBeLeft(error: R): Matchers<R>;
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

    toBeRight<L, R>(received: Either<L, R>, expected: Either<L, R>) {
        const areBothRight = received.isRight() && expected.isRight();
        const areEqual = this.equals(received.extract(), expected.extract());

        const pass = areBothRight && areEqual;

        if (pass) {
            return {
                message: () => `Expected ${received} to not equal ${expected}`,
                pass: true,
            };
        } else {
            return {
                message: () => `Expected ${received} to be equal to ${expected}`,
                pass: false,
            };
        }
    },

    toBeLeft<L, R>(received: Either<L, R>, expected: Either<L, R>) {
        const areBothLeft = received.isLeft() && expected.isLeft();
        const areEqual = this.equals(received.extract(), expected.extract());

        const pass = areBothLeft && areEqual;

        if (pass) {
            return {
                message: () => `Expected ${received} to not equal ${expected}`,
                pass: true,
            };
        } else {
            return {
                message: () => `Expected ${received} to be equal to ${expected}`,
                pass: false,
            };
        }
    }
});