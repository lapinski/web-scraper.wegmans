import fs from 'fs';
import path from 'path';
import config from './config';
import logger from './logger';
import { Page } from 'puppeteer';

/**
 * Save a screenshot of the viewport for the page at the current time.
 *
 * @param page - Puppeteer Page object
 * @param name - Name of the screenshot (without extension or path)
 */
export async function save(page: Page, name: string): Promise<string> {
    const screenshotsConfig = config.get('screenshots');

    if (!screenshotsConfig.enabled) {
        return undefined;
    }

    const screenshotDir = path.resolve(process.cwd(), screenshotsConfig.dir);
    if (!fs.existsSync(screenshotDir)) {
        logger.info('Screenshots Directory did not exist, creating it now.', { screenshotDir });
        fs.mkdirSync(screenshotDir);
    }

    const outputPath = path.resolve(screenshotDir, `${name}.png`);
    logger.info('Saving screenshot', { path: outputPath });
    await page.screenshot({ path: outputPath });

    return outputPath;
}