import { promisify } from 'util';
import { createReadStream } from 'fs';
import { post as postCb } from 'request';
import chalk from 'chalk';
import { IBitBarOptions, IProvider } from '../types';

const post = promisify(postCb);

const BITBAR_HUB = 'https://appium.bitbar.com/wd/hub';
const BITBAR_UPLOAD = 'https://appium.bitbar.com/upload';

function upload(app, { key } : IBitBarOptions) {
    const stream = createReadStream(app);
    const auth = `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
    // Post to the bitbar API
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
    }).then((response) => JSON.parse(response.body));
}

const bitbarProvider : IProvider = (app, wd, mocha, opts) => {
    // Retrieve saucelabs options
    const { bitbar } = opts;
    // Authentication options are required, throw an error
    if (!bitbar) {
        // Be explicit enough so people know what to do next
        throw new Error(`Could not run test: Missing 'bitbar' configuration. Run ${chalk.cyan('kash configure test')} to fix this`);
    }
    const { key } = bitbar;
    // Send the apk to bitbar
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
                // Create custom build name using the options from the config
                build: `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                // Set the test name to be the mocha test name
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
};

export default bitbarProvider;
