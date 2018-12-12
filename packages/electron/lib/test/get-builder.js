const path = require('path');
const fs = require('fs');
const os = require('os');
const electronPath = require('electron');
const ElectronChromedriver = require('./electron-chromedriver');

/**
 * Create a builder to create a driver for each test
 */
module.exports = (webdriver, { app, config = {} }, commandOpts) => {
    const electronChromedriver = new ElectronChromedriver();

    electronChromedriver.start();

    const configPath = path.join(os.tmpdir(), '.kash-electron.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));

    return new webdriver.Builder()
        // The "9515" is the port opened by chrome driver.
        .usingServer('http://localhost:9515')
        .withCapabilities({
            chromeOptions: {
                // Here is the path to the Electron binary.
                binary: electronPath,
                args: [`app=${path.join(__dirname, '../../app')}`, `ui=${app}`, `config=${configPath}`],
            }
        })
        .forBrowser('electron');
};
