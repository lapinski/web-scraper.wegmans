const {URL} = require('url');
const config = require('../config');
const {signIn: pom} = require('../pages');
const Promise = require('bluebird');

module.exports = async function (page) {
    const url = new URL(pom.path, config.baseUrl);
    await page.goto(url);
    await page.waitFor(pom.signInButton);

    //await page.click(pom.usernameInput);
    await page.type(pom.usernameInput, config.user.username);
    //await page.click(pom.passwordInput);
    await page.type(pom.passwordInput, config.user.password);

    try {
        await Promise.all([
            page.waitForNavigation(),
            page.click(pom.signInButton)
        ]);
    } catch(e) {
        console.log('SignIn Failed');
        console.error(e);
    }

    return page;
};
