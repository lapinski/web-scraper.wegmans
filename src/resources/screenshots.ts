import fs, { PathLike, Stats } from 'fs';
import R from 'ramda';
import path from 'path';
import { Page } from 'puppeteer';
import { Just, Maybe, Nothing } from 'purify-ts/adts/Maybe';

//
// Stat's 'Does not Exist' status code
//
const NOT_EXISTS = 34;

const getScreenshotDir = (cwd:string, dir:string) => path.join(cwd, dir);
const getScreenshotPath = (dir:string, name:string) => path.resolve(dir, `${name}.png`);
const isErrNotExists = (err:object) => R.prop('errno', err) === NOT_EXISTS;
const isDirectory = (stats:Stats) => stats && stats.isDirectory();
const doesDirectoryExist = (path:PathLike) => new Promise((resolve, reject) => {
   fs.stat(path, (err, stats) =>
       isDirectory(stats)
        ? resolve(true)
        : isErrNotExists(err)
            ? resolve(false)
            : reject(err)
   )
});

const makeDirectory = (path:PathLike) => new Promise((resolve, reject) => {
    fs.mkdir(path, (err) =>
       err
           ? reject(err)
           : resolve()
    );
});

/**
 * Save a screenshot of the viewport for the page at the current time.
 *
 * @param page - Puppeteer Page object
 * @param name - Name of the screenshot (without extension or path)
 */
function save(config:object, page: Page, name: string): Promise<Maybe<string>> {
    // const screenshotsConfig = config.get('screenshots');

    if (!R.prop('enabled', config)) {
        return Promise.resolve(Nothing);
    }

    const screenshotDir = getScreenshotDir(process.cwd(), R.prop('dir', config));
    const screenshotPath = getScreenshotPath(screenshotDir, name);

    return doesDirectoryExist(screenshotDir)
        .then(exists => exists
            ? Promise.resolve()
            : makeDirectory(screenshotDir)
            // TODO: Add Logging (decorator?) logger.info('Screenshots Directory did not exist, creating it now.', { screenshotDir });
        )

        // TODO: Add 'functional' logging
        // logger.info('Saving screenshot', { path: outputPath });
        .then(() => page.screenshot({ path: screenshotPath }))
        .then(() => Just(screenshotPath));
}

export {
    getScreenshotPath,
    getScreenshotDir,
    isErrNotExists,
    isDirectory,
    doesDirectoryExist,
    save,
};