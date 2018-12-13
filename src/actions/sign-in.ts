import { URL } from 'url';
import config  from '../resources/config';
import logger from '../resources/logger';
import * as screenshots from '../resources/screenshots';
import { Page } from 'puppeteer';
import { PageObjectModel } from '../types/content-types';

const signInPage = <PageObjectModel>{
  path: '/sign-in.html',
  signInButton: '#body-signin button',
  usernameInput: '#body-signin input[type="email"]',
  passwordInput: '#body-signin input[type="password"]',
};

export default async function signIn(page: Page) {
  const url = new URL(signInPage.path, config.baseUrl);
  await page.goto(url.toString());
  await page.waitFor(signInPage.signInButton);

  // await page.click(pom.usernameInput);
  await page.type(signInPage.usernameInput, config.user.username);
  // await page.click(pom.passwordInput);
  await page.type(signInPage.passwordInput, config.user.password);

  try {
    await Promise.all([page.waitForNavigation(), page.click(signInPage.signInButton)]);
  } catch (e) {
    logger.error('SignIn Failed', { error: e });
  }

  await screenshots.save(page, 'signin');

  return page;
}
