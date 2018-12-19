const fs = require('fs');
const path = require('path');

const request = require('request');

const { promisify } = require('util');

const post = promisify(request.post);

function upload(app, { user, key } = {}) {
    const filename = path.basename(app);
    return post({
        headers: {
            // Authorization: `Basic ${new Buffer([user, key].join(":")).toString('base64')}`,
            'Content-Type': 'application/octet-stream',
        },
        url: `https://saucelabs.com/rest/v1/storage/${user}/${filename}?overwrite=true`,
        body: fs.readFileSync(app),
        auth: {
            user,
            pass: key,
        },
    }).then((response) => {
        // TODO: check md5
        return JSON.parse(response.body);
    }).catch(e => console.error(e));
}

const HUB_URL = '';

function saucelabsSetup(app, wd, mocha, opts) {
    // Retrieve saucelabs options
    const { saucelabsOptions } = opts;
    // Authentication options are required, throw an error
    if (!saucelabsOptions) {
        // Be explicit enough so people know what to do next
        throw new Error(`Could not run test on browserstack: Missing 'saucelabsOptions' in your rc file`);
    }
    const { user, key } = saucelabsOptions;
    // Send the apk to saucelabs
    return upload(app, {
        user,
        key,
    }).then(({ filename }) => {
        const builder = (test) => {
            const driver = wd.promiseChainRemote('ondemand.saucelabs.com', 80, user, key);
            const caps = {
                // Create custom build name using the options from the config
                build : `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                // Set the test name to be the mocha test name
                name: test.fullTitle(),
            };
            caps['appiumVersion'] = '1.9.1';
            caps['deviceName'] = 'Samsung Galaxy Tab S3 GoogleAPI Emulator';
            caps['deviceOrientation'] = 'portrait';
            caps['browserName'] = '';
            caps['platformVersion'] = '7.1';
            caps['platformName'] = 'Android';
            caps['app'] = `sauce-storage:${filename}`;
            return driver.init(caps).then(() => driver);
        };
        return builder;
    });
}

module.exports = saucelabsSetup;
