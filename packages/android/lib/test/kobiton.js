const fs = require('fs');
const path = require('path');

const request = require('request');

const { promisify } = require('util');

const post = promisify(request.post);
const put = promisify(request.put);

function upload(app, { user, key } = {}) {
    const stat = fs.statSync(app);
    const stream = fs.createReadStream(app);
    let uploaded = 0;
    stream.on('data', (d) => {
        uploaded += d.length;
        console.log(uploaded / stat.size);
    });
    return post({
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${new Buffer([user, key].join(':')).toString('base64')}`,
            'Accept':'application/json',
        },
        url: 'https://api.kobiton.com/v1/apps/uploadUrl',
        body: JSON.stringify({
            filename: 'app-debug.apk',
        }),
    }).then((response) => {
        return JSON.parse(response.body);
    }).then(({ appPath, url }) => {
        console.log(url);
        return put({
            headers: {
                'Content-Length': stat.size,
                'Content-Type': 'application/octet-stream',
            },
            url,
            body: stream,
        }).then((res) => {
            console.log(res);
        }).catch(e => console.error(e));
    });
}

function kobitonSetup(app, wd, mocha, opts) {
    // Retrieve saucelabs options
    const { kobiton } = opts;
    // Authentication options are required, throw an error
    if (!kobiton) {
        // Be explicit enough so people know what to do next
        throw new Error(`Could not run test on kobiton: Missing 'kobiton' in your rc file`);
    }
    const { user, key } = kobiton;
    // Send the apk to saucelabs
    // TODO: Switch between emulator and real
    return upload(app, {
        user,
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

module.exports = kobitonSetup;
