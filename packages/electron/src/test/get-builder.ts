import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import electronPath = require('electron/index');
import * as chromedriver from 'chromedriver';

/**
 * Create a builder to create a driver for each test
 */
export default (wd, ctx, { app, config = {}, tmpdir = os.tmpdir() }) => {
    chromedriver.start(['--url-base=wd/hub', '--port=9515']);

    const configPath = path.join(tmpdir, '.kash-electron.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));

    ctx.afterAll(() => {
        chromedriver.stop();
    });

    const builder = () => {
        const driver = wd.promiseChainRemote('0.0.0.0', 9515);

        ctx.beforeEach(() => {
            return driver.clearLocalStorage()
                .then(() => restartApp());
        });

        function initDriver() {
            return driver.init({
                browserName: 'chrome',
                chromeOptions: {
                    // Here is the path to the Electron binary.
                    binary: electronPath,
                    args: [`app=${path.join(__dirname, '../../app')}`, `ui=${app}`, `config=${configPath}`, 'automated=true'],
                },
            });
        }

        function restartApp() {
            return driver.refresh();
        }
        return initDriver().then(() => {
            return driver;
        });
    };

    return Promise.resolve(builder);
};
