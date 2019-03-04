import jsc from 'jsverify';
import path from 'path';
import { itHolds } from '../../tests/jsverify-helpers';
import {
    getScreenshotDir,
    getScreenshotPath,
    isErrNotExists,
    isDirectory,
    doesDirectoryExist,
    save,
} from '../screenshots';
import { Just } from 'purify-ts/adts/Maybe';


describe('Screenshots Module', () => {
    describe('getScreenshotDir()', () => {
        itHolds(
            'combines valid strings',
            jsc.pair(jsc.string, jsc.string),
            ([ a, b ]: string[]) => {
                expect(getScreenshotDir(a, b)).toBeJust(Just(path.join(a, b)));
            }
        );

        it('should return nothing for invalid inputs', () => {
            const output = getScreenshotDir(undefined, undefined);
            expect(output).toBeNothing();
        });
    });

    describe('getScreenshotPath()', () => {
        it('should create a valid path for an image, given valid inputs', () => {
            const output = getScreenshotPath('aDirectory', 'aName');
            const expectedPath = path.resolve('.', 'aDirectory', 'aName.png');
            expect(output).toBeJust(Just(expectedPath));
        });

        it('should return a valid path for empty dir and a valid name', () => {
            const output = getScreenshotPath('', 'aName');
            const expectedPath = path.resolve('.', 'aName.png');
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

    describe('isDirectory()', () => { });

    describe('doesDirectoryExist()', () => { });

    describe('save()', () => { });
});