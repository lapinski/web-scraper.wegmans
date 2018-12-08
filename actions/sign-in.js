const { URL } = require('url');
const { signIn: pom } = require('../pages');
const Promise = require('bluebird');
const config = require('../resources/config');
const logger = require('../resources/logger');
const screenshots = require('../resources/screenshots');

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
