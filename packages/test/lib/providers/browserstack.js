"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const request_1 = require("request");
const fs_1 = require("fs");
const chalk_1 = require("chalk");
const post = util_1.promisify(request_1.post);
const BS_UPLOAD_URL = 'https://api-cloud.browserstack.com/app-automate/upload';
const HUB_URL = 'http://hub-cloud.browserstack.com/wd/hub';
;
function upload(app, { user, key }) {
    if (!user) {
        return Promise.reject(new Error('Could not upload to browserstack: Missing \'user\' param'));
    }
    if (!key) {
        return Promise.reject(new Error('Could not upload to browserstack: Missing \'key\' param'));
    }
    return post({
        url: BS_UPLOAD_URL,
        formData: {
            file: fs_1.createReadStream(app),
        },
        auth: {
            user,
            pass: key,
        },
    }).then(response => JSON.parse(response.body));
}
function browserstackSetup(app, wd, mocha, opts) {
    const { browserstack } = opts;
    if (!browserstack) {
        throw new Error(`Could not run test: Missing 'browserstack' configuration. Run ${chalk_1.default.cyan('kash configure test')} to fix this`);
    }
    const { user, key } = browserstack;
    return upload(app, {
        user,
        key,
    }).then(({ app_url }) => {
        const builder = (test) => {
            const driver = wd.promiseChainRemote(HUB_URL);
            return driver.init({
                device: 'Google Nexus 6',
                os_version: '6.0',
                'browserstack.user': user,
                'browserstack.key': key,
                build: `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                name: test.fullTitle(),
                app: app_url,
                autoWebview: true,
            }).then(() => driver);
        };
        return builder;
    });
}
exports.default = browserstackSetup;
//# sourceMappingURL=browserstack.js.map