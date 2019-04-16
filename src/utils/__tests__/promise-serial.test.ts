import 'jest-extended';

import promiseSerial from '../promise-serial';

const makeMockPromise = (
    config: {
        duration: number;
        returnValue: any;
        startHook: Function;
        completeHook: Function;
    },
) =>
    jest.fn(() => {
    return new Promise((resolve, reject) => {
        config.startHook();
        setTimeout(() => {
            config.completeHook();
            resolve(config.returnValue);
        }, config.duration);
    });
});

describe('Promise serial helper', () => {
    describe('promiseSerial()', () => {
        //
        // Generally, we wouldn't want to assert the call order of mock fns
        // however, in this case we actually want to make sure it
        // happens serially, even if some resolve before others.
        //

        describe('when given a single promise', () => {
            it('should resolve the single promise', (done) => {
                const input = Promise.resolve('value');

                promiseSerial([input])
                    .then((output) => {

                        expect(output).toBeInstanceOf(Array);
                        expect(output).toHaveLength(1);
                        expect(output[0]).toBe('value');
                        done();
                    })
                    .catch((err) => done(err));
            });
        });

        describe('when given two promises', () => {
            //
            // PromiseOne has a timeout less than Promise Two
            // This is to show that PromiseOne must resolve before
            // PromiseTwo starts. (and are executed sequentially)
            //

            // These hooks work to ensure the correct
            // initial call of the promise, the correct resolution
            // and the order in which they occur (sequentially)
            const config = {
                one: {
                    duration: 5000,
                    returnValue: 'valueOne',
                    startHook: jest.fn(() => {
                        console.log('startOne');
                    }),
                    completeHook: jest.fn(() => {
                        console.log('completeOne');
                    }),
                },
                two: {
                    returnValue: 'valueTwo',
                    duration: 1000,
                    startHook: jest.fn(() => {
                        console.log('startTwo');
                    }),
                    completeHook: jest.fn(() => {
                        console.log('completeTwo');
                    }),
                },
            };

            const MockPromiseOne = makeMockPromise(config.one);
            const MockPromiseTwo = makeMockPromise(config.two);

            const input = [
                new MockPromiseOne(),
                new MockPromiseTwo(),
            ];

            let output: any[];

            beforeAll((done) => {
                promiseSerial(input)
                    .then((result) => {
                        output = result;
                        done();
                    });
            });

            it('should resolve each promise', () => {
                expect(output).toBeInstanceOf(Array);
                expect(output).toHaveLength(2);
                expect(output[0]).toBe('valueOne');
                expect(output[1]).toBe('valueTwo');
            });

            it('should resolve the first promise', () => {
                expect(MockPromiseOne).toHaveBeenCalledTimes(1);
            });

            it('should resolve the second promise', () => {
                expect(MockPromiseTwo).toHaveBeenCalledTimes(1);
            });

            it('should have called the first start hook', () => {
                expect(config.one.startHook).toHaveBeenCalled();
            });

            it('should have called the first complete hook', () => {
                expect(config.one.completeHook).toHaveBeenCalled();
            });

            it('should have called the second start hook', () => {
                expect(config.two.startHook).toHaveBeenCalled();
            });

            it('should have called the second complete hook', () => {
                expect(config.two.completeHook).toHaveBeenCalled();
            });

            it('should have called complete one after start one', () => {
                expect(config.one.completeHook).toHaveBeenCalledAfter(config.one.startHook);
            });

            it('should have called complete two after start two', () => {
                expect(config.two.completeHook).toHaveBeenCalledAfter(config.two.startHook);
            });

            it('should have called start two after complete one', () => {
                expect(config.two.startHook)
                    .toHaveBeenCalledAfter(config.one.completeHook);
            });
        });
    });
});