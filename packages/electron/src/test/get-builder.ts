import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import electronPath = require('electron/index');
import { ElectronChromedriver } from './electron-chromedriver';

/**
 * Create a builder to create a driver for each test
 */
export default (wd, mocha, { app, config = {}, tmpdir = os.tmpdir() }) => {
    const electronChromedriver = new ElectronChromedriver();

    electronChromedriver.start(9515);

    const configPath = path.join(tmpdir, '.kash-electron.config.json');
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
