import { createReadStream } from 'fs';
import { basename } from 'path';
import chalk from 'chalk';
import { promisify } from 'util';
import { post as postCb } from 'request';
import { IProvider, ISaucelabsOptions } from '../types';

const post = promisify(postCb) as (f : any) => Promise<any>;

function uploadForEmulator(app, { user, key } : ISaucelabsOptions) {
    const filename = basename(app);
    const stream = createReadStream(app);
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
    }).then((response) => JSON.parse(response.body));
}

const saucelabsProvider : IProvider = function saucelabsSetup(app, wd, ctx, opts) {
    // Retrieve saucelabs options
    const { saucelabs } = opts;
    // Authentication options are required, throw an error
    if (!saucelabs) {
        // Be explicit enough so people know what to do next
        throw new Error(`Could not run test: Missing 'saucelabs' configuration. Run ${chalk.cyan('kash configure test')} to fix this`);
    }
    const { user, key } = saucelabs;
    // Send the apk to saucelabs
    return uploadForEmulator(app, {
        user,
        key,
    }).then(({ filename }) => {
        const builder = () => {
            const driver = wd.promiseChainRemote('ondemand.saucelabs.com', 80, user, key);
            const caps = {
                // Create custom build name using the options from the config
                build: `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                name: '',
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
};

export default saucelabsProvider;
