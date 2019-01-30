import { URL } from 'url';
import config  from '../resources/config';
import { log, LogLevel } from '../resources/logger';
import * as screenshots from '../resources/screenshots';
import { Page } from 'puppeteer';
import * as logger from '../resources/logger';

const signInPage = {
  path: '/sign-in.html',
  signInButton: '#body-signin button',
  usernameInput: '#body-signin input[type="email"]',
  passwordInput: '#body-signin input[type="password"]',
};

const wegmansConfig = config.get('wegmans');

export default async function signIn(page: Page) {
  const url = new URL(signInPage.path, wegmansConfig.paths.baseUrl);

  log(LogLevel.Info, 'Navigating to Login Page', { url });
  await page.goto(url.toString());

  log(LogLevel.Info, 'Waiting for Sign In Button to appear', { selector: signInPage.signInButton });
  await page.waitFor(signInPage.signInButton);

  log(LogLevel.Info, 'Filling out Sign-In Form', { username: wegmansConfig.username });
  await page.type(signInPage.usernameInput, wegmansConfig.username);
  await page.type(signInPage.passwordInput, wegmansConfig.password);

  try {
    await Promise.all([
        page.waitForNavigation(),
        page.click(signInPage.signInButton),
    ]);
      log(LogLevel.Info, 'Sign-In Succeeded');
  } catch (e) {
      log(LogLevel.Info, 'SignIn Failed', { error: e });
  }

  log(LogLevel.Info, 'Saving screenshot');
  await screenshots.save(config.get('screenshots'), page, 'signin');

  return page;
}
