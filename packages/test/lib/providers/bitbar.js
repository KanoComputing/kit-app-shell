"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const fs_1 = require("fs");
const request_1 = require("request");
const chalk_1 = require("chalk");
const post = util_1.promisify(request_1.post);
const BITBAR_HUB = 'https://appium.bitbar.com/wd/hub';
const BITBAR_UPLOAD = 'https://appium.bitbar.com/upload';
function upload(app, { key }) {
    const stream = fs_1.createReadStream(app);
    const auth = `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
    return post({
        headers: {
            Accept: 'application/json',
            Authorization: auth,
        },
        url: BITBAR_UPLOAD,
        formData: {
            file: {
                value: stream,
                options: {
                    contentType: 'application/octet-stream',
                },
            },
        },
    }).then(response => JSON.parse(response.body));
}
function saucelabsSetup(app, wd, mocha, opts) {
    const { bitbar } = opts;
    if (!bitbar) {
        throw new Error(`Could not run test: Missing 'bitbar' configuration. Run ${chalk_1.default.cyan('kash configure test')} to fix this`);
    }
    const { key } = bitbar;
    return upload(app, {
        key,
    }).then(({ value }) => {
        const { uploads } = value;
        const { file } = uploads;
        const builder = (test) => {
            const driver = wd.promiseChainRemote(BITBAR_HUB);
            const caps = {
                testdroid_project: `${opts.config.APP_NAME} Android`,
                testdroid_target: 'android',
                testdroid_device: '',
                testdroid_apiKey: key,
                build: `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                name: test.fullTitle(),
                testdroid_testrun: test.fullTitle(),
                testdroid_app: file,
                testdroid_findDevice: true,
                platformName: 'Android',
                deviceName: '-',
            };
            return driver.init(caps).then(() => driver);
        };
        return builder;
    });
}
exports.default = saucelabsSetup;
//# sourceMappingURL=bitbar.js.map