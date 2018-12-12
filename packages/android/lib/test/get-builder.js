require('chromedriver');
/**
 * Create a builder to create a driver for each test
 */
module.exports = (webdriver, { app, config = {} }, commandOpts) => {
    return new webdriver.Builder()
        .withCapabilities({
            chromeOptions: {
                androidPackage: config.APP_ID,
                androidActivity: '.MainActivity',
            }
        })
        .forBrowser('chrome');
};
