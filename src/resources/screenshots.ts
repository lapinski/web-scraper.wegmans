import fs from 'fs';
import path from 'path';
import config from './config';
import { Page } from 'puppeteer';

export async function save(page: Page, name:string):Promise<void> {
  // @ts-ignore
  if (!config.screenshots.save) {
    return;
  }

  // @ts-ignore
  const screenshotDir = path.resolve(process.cwd(), config.screenshots.dir);
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  await page.screenshot({ path: path.resolve(screenshotDir, `${name}.png`) });
}