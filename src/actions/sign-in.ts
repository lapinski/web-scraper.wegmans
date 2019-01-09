import { URL } from 'url';
import config  from '../resources/config';
import logger from '../resources/logger';
import * as screenshots from '../resources/screenshots';
import { Page } from 'puppeteer';

const signInPage = {
  path: '/sign-in.html',
  signInButton: '#body-signin button',
  usernameInput: '#body-signin input[type="email"]',
  passwordInput: '#body-signin input[type="password"]',
};

const wegmansConfig = config.get('wegmans');

export default async function signIn(page: Page) {
  const url = new URL(signInPage.path, wegmansConfig.paths.baseUrl);

  logger.info('Navigating to Login Page', { url });
  await page.goto(url.toString());

  logger.info('Waiting for Sign In Button to appear', { selector: signInPage.signInButton });
  await page.waitFor(signInPage.signInButton);

  logger.info('Filling out Sign-In Form', { username: wegmansConfig.username });
  await page.type(signInPage.usernameInput, wegmansConfig.username);
  await page.type(signInPage.passwordInput, wegmansConfig.password);

  try {
    await Promise.all([
        page.waitForNavigation(),
        page.click(signInPage.signInButton),
    ]);
    logger.info('Sign-In Succeeded');
  } catch (e) {
    logger.error('SignIn Failed', { error: e });
  }

  logger.info('Saving screenshot');
  await screenshots.save(page, 'signin');

  return page;
}
