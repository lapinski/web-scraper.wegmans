import fs from 'fs';
import R from 'ramda';
import { Either, Left, Right } from 'purify-ts/adts/Either';

interface Formatter {
    (obj: object): string;
}

const objToString = (obj: object): string => JSON.stringify(obj);
const prettyObjToString = (obj: object): string => JSON.stringify(obj, undefined, 2);

const writeObjToDisk = R.curry(
    (formatter: Formatter, path: string, obj: object): Promise<Either<Error, string>> =>
    new Promise((resolve) =>
        fs.writeFile(
            path,
            formatter(obj),
            (err) => err
                        ? resolve(Left(err))
                        : resolve(Right(path))
        )
    )
);

export {
    Formatter,
    objToString,
    prettyObjToString,
    writeObjToDisk,
};

export default writeObjToDisk(objToString);