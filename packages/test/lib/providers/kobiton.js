"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const chalk_1 = require("chalk");
const util_1 = require("util");
const request_1 = require("request");
const post = util_1.promisify(request_1.post);
const put = util_1.promisify(request_1.put);
function upload(app, { user, key }) {
    const stat = fs_1.statSync(app);
    const stream = fs_1.createReadStream(app);
    const auth = `Basic ${Buffer.from([user, key].join(':')).toString('base64')}`;
    const filename = path_1.basename(app);
    return post({
        headers: {
            'Content-Type': 'application/json',
            Authorization: auth,
            Accept: 'application/json',
        },
        url: 'https://api.kobiton.com/v1/apps/uploadUrl',
        body: JSON.stringify({
            filename,
            appId: '23313',
        }),
    }).then(response => JSON.parse(response.body)).then(({ appPath, url }) => put({
        headers: {
            'Content-Length': stat.size,
            'Content-Type': 'application/octet-stream',
            'x-amz-tagging': 'unsaved=true',
        },
        url,
        body: stream,
    })
        .then(() => post({
        headers: {
            'Content-Type': 'application/json',
            Authorization: auth,
            Accept: 'application/json',
        },
        url: 'https://api.kobiton.com/v1/apps',
        body: JSON.stringify({
            appPath,
            filename,
        }),
    }).then(r => JSON.parse(r.body))));
}
function getConfig(opts, key) {
    const value = opts[key];
    if (typeof value === 'undefined') {
        throw new Error(`Could not run test: Missing '${key}' in your rc file. Run ${chalk_1.default.cyan('kash configure test')} to fix this.`);
    }
    return value;
}
function kobitonSetup(app, wd, mocha, opts) {
    const kobiton = getConfig(opts, 'kobiton');
    const { user, key } = kobiton;
    return upload(app, {
        user,
        key,
    }).then(({ appId }) => {
        const builder = (test) => {
            const browser = wd.promiseChainRemote({
                protocol: 'https',
                host: 'api.kobiton.com',
                auth: `${user}:${key}`,
            });
            const caps = {
                app: `kobiton-store:${appId}`,
                sessionName: `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                sessionDescription: test.fullTitle(),
                deviceOrientation: 'portrait',
                captureScreenshots: true,
                browserName: 'chrome',
                platformName: 'Android',
                platformVersion: '8.1.0',
                deviceName: 'Nexus 5X',
                'appium-version': '1.9.1',
            };
            return browser.init(caps).then(() => browser);
        };
        return builder;
    });
}
exports.default = kobitonSetup;
//# sourceMappingURL=kobiton.js.map