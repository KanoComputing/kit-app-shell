"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const os = require("os");
const electronPath = require("electron/index");
const electron_chromedriver_1 = require("./electron-chromedriver");
exports.default = (wd, mocha, { app, config = {}, tmpdir = os.tmpdir() }) => {
    const electronChromedriver = new electron_chromedriver_1.ElectronChromedriver();
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
                binary: electronPath,
                args: [`app=${path.join(__dirname, '../../app')}`, `ui=${app}`, `config=${configPath}`],
            },
        }).then(() => driver);
    };
    return Promise.resolve(builder);
};
//# sourceMappingURL=get-builder.js.map