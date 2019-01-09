"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const chalk_1 = require("chalk");
const util_1 = require("util");
const request_1 = require("request");
const post = util_1.promisify(request_1.post);
function uploadForEmulator(app, { user, key }) {
    const filename = path_1.basename(app);
    const stream = fs_1.createReadStream(app);
    return post({
        headers: {
            'Content-Type': 'application/octet-stream',
        },
        url: `https://saucelabs.com/rest/v1/storage/${user}/${filename}?overwrite=true`,
        body: stream,
        auth: {
            user,
            pass: key,
        },
    }).then(response => JSON.parse(response.body));
}
function saucelabsSetup(app, wd, mocha, opts) {
    const { saucelabs } = opts;
    if (!saucelabs) {
        throw new Error(`Could not run test: Missing 'saucelabs' configuration. Run ${chalk_1.default.cyan('kash configure test')} to fix this`);
    }
    const { user, key } = saucelabs;
    return uploadForEmulator(app, {
        user,
        key,
    }).then(({ filename }) => {
        const builder = (test) => {
            const driver = wd.promiseChainRemote('ondemand.saucelabs.com', 80, user, key);
            const caps = {
                build: `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                name: test.fullTitle(),
                appiumVersion: '1.9.1',
                deviceName: 'Samsung Galaxy Tab S3 GoogleAPI Emulator',
                deviceOrientation: 'portrait',
                browserName: '',
                platformVersion: '7.1',
                platformName: 'Android',
                app: `sauce-storage:${filename}`,
            };
            return driver.init(caps).then(() => driver);
        };
        return builder;
    });
}
module.exports = saucelabsSetup;
//# sourceMappingURL=saucelabs.js.map