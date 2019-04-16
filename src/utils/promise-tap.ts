import R from 'ramda';

interface SideEffect {
    <T>(input: T): void;
}

const tap = R.curry(
    <T>(f: SideEffect, input: T): T => {
        f(input);
        return input;
    }
);

const tapLogger = (message: string) => tap(() => console.log(message));

export {
    SideEffect,
    tap,
    tapLogger,
};

export default tap;

// TODO: Really clean this up w/ types so that its generally usable