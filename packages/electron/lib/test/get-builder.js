const path = require('path');
const fs = require('fs');
const os = require('os');
const electronPath = require('electron');
const ElectronChromedriver = require('./electron-chromedriver');

/**
 * Create a builder to create a driver for each test
 */
module.exports = (wd, mocha, { app, config = {} }) => {
    const electronChromedriver = new ElectronChromedriver();

    electronChromedriver.start(9515);

    const configPath = path.join(os.tmpdir(), '.kash-electron.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));

    mocha.suite.afterAll(() => {
        electronChromedriver.stop();
    });

    const builder = () => {
        const driver = wd.promiseChainRemote('0.0.0.0', 9515);
        return driver.init({
            browserName: 'chrome',
            chromeOptions: {
                // Here is the path to the Electron binary.
                binary: electronPath,
                args: [`app=${path.join(__dirname, '../../app')}`, `ui=${app}`, `config=${configPath}`],
            },
        }).then(() => driver);
    };

    return Promise.resolve(builder);

};
