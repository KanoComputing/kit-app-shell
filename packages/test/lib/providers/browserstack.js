const { promisify } = require('util');
const request = require('request');
const fs = require('fs');

const post = promisify(request.post);

const BS_UPLOAD_URL = 'https://api-cloud.browserstack.com/app-automate/upload';
const HUB_URL = 'http://hub-cloud.browserstack.com/wd/hub';

/**
 * Uploads an app to browserstack
 * @param {String} app Path to the app to upload
 * @param {{ user: String, key: String }} param1 Browserstack credentials
 */
function upload(app, { user, key } = {}) {
    if (!user) {
        return Promise.reject(new Error(`Could not upload to browserstack: Missing 'user' param`));
    }
    if (!key) {
        return Promise.reject(new Error(`Could not upload to browserstack: Missing 'key' param`));
    }
    return post({
        url: BS_UPLOAD_URL,
        formData: {
            file: fs.createReadStream(app),
        },
        auth: {
            user,
            pass: key,
        },
    }).then((response) => {
        return JSON.parse(response.body);
    });
}

function browserstackSetup(app, wd, mocha, opts) {
    // Retrieve browserstack options
    const { browserstack } = opts;
    // Authentication options are required, throw an error
    if (!browserstack) {
        // Be explicit enough so peopoe know what to do next
        throw new Error(`Could not run test on browserstack: Missing 'browserstack' in your rc file`);
    }
    const { user, key } = browserstack;
    // Send the apk to browserstack
    return upload(app, {
        user,
        key,
    }).then(({ app_url }) => {
        const builder = (test) => {
            const driver = wd.promiseChainRemote(HUB_URL);
            return driver.init({
                // TODO: parametrize this
                device: 'Google Nexus 6',
                os_version: '6.0',
                'browserstack.user': user,
                'browserstack.key' : key,
                // Create custom build name using the options from the config
                build : `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                // Set the test name to be the mocha test name
                name: test.fullTitle(),
                // Use the browserstack app URL (bs://<hash>)
                app : app_url,
                // Let appium switch to the webview context for us
                autoWebview: true,
            }).then(() => driver);
        };
        return builder;
    });
}

module.exports = browserstackSetup;
