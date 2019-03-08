import jsc from 'jsverify';
import path from 'path';
import { itHolds } from '../../tests/jsverify-helpers';
import {
    getScreenshotDir,
    getScreenshotPath,
    isErrNotExists,
    isDirectory,
    doesDirectoryExist,
    save, GetStats, fsMakeDirectory, GetBaseDirectory,
} from '../screenshots';
import { Just, Maybe } from 'purify-ts/adts/Maybe';
import { PathLike, Stats } from 'fs';
import { Right } from 'purify-ts/adts/Either';
import { ScreenshotsConfig } from '../config';
import { Page } from 'puppeteer';

describe('Screenshots Module', () => {
    const dirExistsGetStats: GetStats = (path, callback) => {
        callback(undefined, <Stats>{ isDirectory: () => true });
    };

    const notDirGetStats: GetStats = (path, callback) => {
        callback(undefined, <Stats>{ isDirectory: () => false });
    };

    const notExistsGetStats: GetStats = (path, callback) => {
        callback(<Error><unknown>{ errno: 34 }, undefined);
    };

    const otherErrorGetStats: GetStats = (path, callback) => {
        callback(new Error(), undefined);
    };

    const validGetBaseDir: GetBaseDirectory = () => 'aBaseDir';
    const invalidGetBaseDir: GetBaseDirectory = () => undefined;

    describe('getScreenshotDir()', () => {
        itHolds(
            'combines valid strings',
            jsc.pair(jsc.string, jsc.string),
            ([ a, b ]: string[]) => {
                expect(getScreenshotDir(a, b)).toBeJust(Just(path.join(a, b)));
            },
        );

        it('should return nothing for invalid inputs', () => {
            const output = getScreenshotDir(undefined, undefined);
            expect(output).toBeNothing();
        });
    });

    describe('getScreenshotPath()', () => {
        it('should create a valid path for an image, given valid inputs', () => {
            const output = getScreenshotPath('aDirectory', 'aName');
            const expectedPath = path.join('aDirectory', 'aName.png');
            expect(output).toBeJust(Just(expectedPath));
        });

        it('should return a valid path for empty dir and a valid name', () => {
            const output = getScreenshotPath('', 'aName');
            const expectedPath = path.join('aName.png');
            expect(output).toBeJust(Just(expectedPath));
        });

        it('should return nothing for empty inputs', () => {
            const output = getScreenshotPath('', '');
            expect(output).toBeNothing();
        });

        it('should return nothing for undefined inputs', () => {
            const output = getScreenshotPath(undefined, undefined);
            expect(output).toBeNothing();
        });
    });

    describe('isErrNotExists()', () => {
        it('should return true for valid \'Error Not Exists\'', () => {
        const input = { errno: 34 };
        expect(isErrNotExists(input)).toBe(true);
        });

        it('should return false for valid object, wrong code', () => {
            const input = { errno: 0 };
            expect(isErrNotExists(input)).toBe(false);
        });

        it('should return false for valid object, missing prop', () => {
            const input = { };
            expect(isErrNotExists(input)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isErrNotExists(undefined)).toBe(false);
        });
    });

    describe('isDirectory()', () => {
        it('should return true when given object that is directory', () => {
            const input = <Stats>{
                isDirectory: () => true,
            };

            expect(isDirectory(input)).toBe(true);
        });

        it('should return false when given undefined', () => {
            expect(isDirectory(undefined)).toBeFalsy();
        });

        it('should return false when given object that is not a directory', () => {
            const input = <Stats>{
            isDirectory: () => false,
            };
            expect(isDirectory(input)).toBe(false);
        });
    });

    describe('doesDirectoryExist()', () => {
        const validPathStub = <PathLike>{ };

        it('should return true given inputs for a directory that exists', () =>
            doesDirectoryExist(dirExistsGetStats, validPathStub)
                .then(result => {
                    expect(result).toBeRight(Right(true));
                })
        );

        it('should return true given inputs for a file that exists, but isn\'t a directory', () =>
            doesDirectoryExist(notDirGetStats, validPathStub)
                .then(result => {
                    expect(result).toBeRight(Right(false));
                })
        );

        it('should return false given inputs for a directory that does not exist', () =>
            doesDirectoryExist(notExistsGetStats, validPathStub)
                .then(result => {
                    expect(result).toBeRight(Right(false));
                })
        );

        it('should return an error given inputs that return fs.stat for that isn\'t \'NotExists\'', () =>
            doesDirectoryExist(otherErrorGetStats, validPathStub)
                .then(result => {
                    expect(result.isLeft()).toBe(true);
                    expect(result.extract()).toBeInstanceOf(Error);
                })
        );

        it('should return an error given invalid \'GetStats\'', () =>
            doesDirectoryExist(undefined, validPathStub)
                .then(result => {
                    expect(result.isLeft()).toBe(true);
                    expect(result.extract()).toBeInstanceOf(Error);
                    expect(result.extract()).toHaveProperty('message', 'Invalid getStats');
                })
        );
    });

    describe('save()', () => {

        const ValidMockPage = jest.fn<Page>(() => ({
            screenshot: jest.fn()
        }));

        it('should resolve Nothing when disabled', () => {
            const config = <ScreenshotsConfig>{ enabled: false };
            const mockPage = <Page>{ };
            const name = 'some-name';

            return save(validGetBaseDir, dirExistsGetStats, fsMakeDirectory, config, mockPage, name)
                .then(response => {
                    expect(response).toBeNothing();
                });
        });

        it('should resolve the screenshotPath when enabled', () => {
            const config = <ScreenshotsConfig>{
                dir: 'base-path',
                enabled: true
            };
            const name = 'some-name';
            const mockPage = new ValidMockPage();
            const baseDir = validGetBaseDir();
            const expectedPath = Just(path.join(baseDir, 'base-path', 'some-name.png'));

            return save(validGetBaseDir, dirExistsGetStats, fsMakeDirectory, config, mockPage, name)
                .then(response => {
                    expect(response).toBeJust(expectedPath);
                });
        });

        describe('when fs.mkdir fails', () => {

            it('should resolve Nothing', () => {
                const config = <ScreenshotsConfig>{
                    dir: 'base-path',
                    enabled: true
                };
                const name = 'some-name';
                const mockPage = new ValidMockPage();
                const mockMkDir = () => Promise.reject(new Error());

                return save(validGetBaseDir, notExistsGetStats, mockMkDir, config, mockPage, name)
                    .then(response => {
                        expect(response).toBeNothing();
                    });
            });
        });

        describe('when getScreenshotDir fails', () => {

            it('should resolve Nothing', () => {
                const config = <ScreenshotsConfig>{
                    dir: 'base-path',
                    enabled: true
                };
                const name = 'some-name';
                const mockPage = new ValidMockPage();

                return save(invalidGetBaseDir, notExistsGetStats, fsMakeDirectory, config, mockPage, name)
                    .then(response => {
                        expect(response).toBeNothing();
                    });
            });
        });
    });
});