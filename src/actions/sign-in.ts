import { URL } from 'url';
import { signIn as pom } from ' ../pages/index';
import Promise from 'bluebird';
import config  from '../resources/config';
import logger from '../resources/logger';
import screenshots from '../resources/screenshots';

/**
 *
 * @param page
 * @returns {Promise<*>}
 */
module.exports = async function signIn(page) {
  const url = new URL(pom.path, config.baseUrl);
  await page.goto(url);
  await page.waitFor(pom.signInButton);

  // await page.click(pom.usernameInput);
  await page.type(pom.usernameInput, config.user.username);
  // await page.click(pom.passwordInput);
  await page.type(pom.passwordInput, config.user.password);

  try {
    await Promise.all([page.waitForNavigation(), page.click(pom.signInButton)]);
  } catch (e) {
    logger.error('SignIn Failed', { error: e });
  }

  await screenshots.save(page, 'signin');

  return page;
};
