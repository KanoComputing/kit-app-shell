const fs = require('fs');
const path = require('path');

const request = require('request');

const { promisify } = require('util');

const post = promisify(request.post);

// TODO: Upload to bucket instead of direct upload for speed and consistency across all cloud test services

function uploadForEmulator(app, { user, key } = {}) {
    const filename = path.basename(app);
    const stat = fs.statSync(app);
    const stream = fs.createReadStream(app);
    let uploaded = 0;
    stream.on('data', (d) => {
        uploaded += d.length;
        console.log(uploaded / stat.size);
    });
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
    }).then((response) => {
        return JSON.parse(response.body);
    });
}

function saucelabsSetup(app, wd, mocha, opts) {
    // Retrieve saucelabs options
    const { saucelabs } = opts;
    // Authentication options are required, throw an error
    if (!saucelabs) {
        // Be explicit enough so people know what to do next
        throw new Error(`Could not run test on saucelabs: Missing 'saucelabs' in your rc file`);
    }
    const { user, key } = saucelabs;
    // Send the apk to saucelabs
    return uploadForEmulator(app, {
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
