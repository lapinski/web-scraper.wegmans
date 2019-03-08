import fs, { PathLike, Stats } from 'fs';
import R from 'ramda';
import path from 'path';
import { Page } from 'puppeteer';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';
import { ScreenshotsConfig } from './config';
import { Either, Left, Right } from 'purify-ts/adts/Either';

//
// Stat's 'Does not Exist' status code
//
const NOT_EXISTS = 34;
const isString = R.is(String);

const getScreenshotDir = (cwd: string, dir: string) =>
    isString(cwd) && isString(dir)
        ? Just(path.join(cwd, dir))
        : Nothing;

const getScreenshotPath = (dir: string, name: string) =>
    isString(dir) && name
        ? Just(path.join(dir, `${name}.png`))
        : Nothing;

const isErrNotExists = (err: object): boolean => R.prop('errno', err) === NOT_EXISTS;

const isDirectory = (stats: Stats): boolean => stats && stats.isDirectory();

export interface GetStats {
    (path: PathLike, callback: (error: Error, stats: Stats) => void): void;
}

const doesDirectoryExist = (getStats: GetStats, path: PathLike): Promise<Either<Error, boolean>> =>
    new Promise((resolve) =>
        getStats
            ? getStats(path, (err, stats) =>
                err // TODO: Clean this up, it's nested too deep.
                    ? isErrNotExists(err)
                        ? resolve(Right(false))
                        : resolve(Left(err))
                    : resolve(Right(isDirectory(stats)))
            )
            : resolve(Left(new Error('Invalid getStats'))));

interface MakeDirectory {
    (path: PathLike): Promise<void>;
}

const fsMakeDirectory = (path: PathLike) => new Promise<void>((resolve, reject) => {
    fs.mkdir(path, (err) =>
        err
            ? reject(err)
            : resolve()
    );
});

interface GetBaseDirectory {
    (): string;
}

/**
 * Save a screenshot of the viewport for the page at the current time.
 *
 * @param page - Puppeteer Page object
 * @param name - Name of the screenshot (without extension or path)
 */
const save = R.curry(
    (getBaseDir: GetBaseDirectory, getStats: GetStats, makeDirectory: MakeDirectory, config: ScreenshotsConfig, page: Page, name: string): Promise<Maybe<string>> => {
    // const screenshotsConfig = config.get('screenshots');

    if (!R.prop('enabled', config)) {
        return Promise.resolve(Nothing);
    }

    const screenshotDir = getScreenshotDir(getBaseDir(), R.prop('dir', config));
    const screenshotPath = getScreenshotPath(screenshotDir.extract(), name);

    return (screenshotDir.isNothing() || screenshotPath.isNothing())
        ? Promise.resolve(Nothing)
        : doesDirectoryExist(getStats, screenshotDir.extract())
            .then(exists => exists.isRight() && exists.extract() === true
                ? Promise.resolve()
                : makeDirectory(screenshotDir.extract())
                // TODO: Add Logging (decorator?) logger.info('Screenshots Directory did not exist, creating it now.', { screenshotDir });
                // TODO: Try to make use of the chain of maybe / eithers
            )

            // TODO: Add 'functional' logging
            // logger.info('Saving screenshot', { path: outputPath });
            .then(() => page.screenshot({ path: screenshotPath.extract() }))
            .then(() => screenshotPath)

            // TODO: Add Error Logging
            .catch(() => Nothing);
});

export {
    MakeDirectory,
    GetBaseDirectory,
    fsMakeDirectory,
    getScreenshotDir,
    getScreenshotPath,
    isErrNotExists,
    isDirectory,
    doesDirectoryExist,
    save,
};