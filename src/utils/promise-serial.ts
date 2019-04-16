import R from 'ramda';

export interface PromiseSerial {
    <T>(promises: Promise<T>[]): Promise<T[]>;
}

const serialPromises: PromiseSerial = <T>(promises: Promise<T>[]): Promise<T[]> =>
    R.reduce(
        (chain: Promise<T[]>, task: Promise<T>) =>
            chain.then((chainResult: T[]) =>
                task.then((taskResult: T) => [...chainResult, taskResult])
        ),
        Promise.resolve([]),
        promises,
    );


export default serialPromises;