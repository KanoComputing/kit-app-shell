const fs = require('fs');
const path = require('path');

const request = require('request');

const { promisify } = require('util');

const post = promisify(request.post);

function upload(app, { key } = {}) {
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
            Accept: 'application/json',
            Authorization: `Basic ${new Buffer(`${key}:`).toString('base64')}`,
        },
        url: 'https://appium.bitbar.com/upload',
        formData: {
            file: {
                value: stream,
                options: {
                    contentType: 'application/octet-stream',
                },
            },
        },
    }).then((response) => {
        // TODO: check md5
        return JSON.parse(response.body);
    });
}

function saucelabsSetup(app, wd, mocha, opts) {
    // Retrieve saucelabs options
    const { bitbarOptions } = opts;
    // Authentication options are required, throw an error
    if (!bitbarOptions) {
        // Be explicit enough so people know what to do next
        throw new Error(`Could not run test on bitbar: Missing 'bitbarOptions' in your rc file`);
    }
    const { key } = bitbarOptions;
    // Send the apk to saucelabs
    // TODO: Switch between emulator and real
    return upload(app, {
        key,
    }).then(({ value }) => {
        const { uploads } = value;
        const { file } = uploads;
        const builder = (test) => {
            const driver = wd.promiseChainRemote('https://appium.bitbar.com/wd/hub');
            const caps = {
                testdroid_project: `${opts.config.APP_NAME} Android`,
                testdroid_target: 'android',
                testdroid_device: '',
                testdroid_apiKey: key,
                // Create custom build name using the options from the config
                build : `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                // Set the test name to be the mocha test name
                name: test.fullTitle(),
                testdroid_testrun: test.fullTitle(),
                testdroid_app: file,
                testdroid_findDevice: true,
                autoWebview: true,
                platformName: 'Android',
                deviceName: '-',
            };
            return driver.init(caps).then(() => driver);
        };
        return builder;
    });
}

module.exports = saucelabsSetup;
