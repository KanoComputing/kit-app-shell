import { createReadStream, statSync } from 'fs';
import { basename } from 'path';
import chalk from 'chalk';
import { promisify } from 'util';

import { post as postCb, put as putCb } from 'request';
import { IKobitonOptions, IProvider } from '../types';

const post = promisify(postCb);
const put = promisify(putCb);

function upload(app, { user, key } : IKobitonOptions) {
    const stat = statSync(app);
    const stream = createReadStream(app);
    const auth = `Basic ${Buffer.from([user, key].join(':')).toString('base64')}`;
    const filename = basename(app);
    return post({
        headers: {
            'Content-Type': 'application/json',
            'Authorization': auth,
            'Accept': 'application/json',
        },
        url: 'https://api.kobiton.com/v1/apps/uploadUrl',
        body: JSON.stringify({
            filename,
            appId: '23313',
        }),
    }).then((response) => JSON.parse(response.body)).then(({ appPath, url }) => put({
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
                'Authorization': auth,
                'Accept': 'application/json',
            },
            url: 'https://api.kobiton.com/v1/apps',
            body: JSON.stringify({
                appPath,
                filename,
            }),
        }).then((r) => JSON.parse(r.body))));
}

function getConfig(opts, key) {
    const value = opts[key];

    if (typeof value === 'undefined') {
        throw new Error(`Could not run test: Missing '${key}' in your rc file. Run ${chalk.cyan('kash configure test')} to fix this.`);
    }

    return value;
}

const kobitonProvider : IProvider = function kobitonSetup(app, wd, ctx, opts) {
    // Retrieve saucelabs options
    const kobiton = getConfig(opts, 'kobiton');
    const { user, key } = kobiton;
    // Send the apk to kobiton's servers
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
                'app': `kobiton-store:${appId}`,
                'sessionName': `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                'sessionDescription': test.fullTitle(),
                'deviceOrientation': 'portrait',
                'captureScreenshots': true,
                'browserName': 'chrome',
                'platformName': 'Android',
                'platformVersion': '8.1.0',
                'deviceName': 'Nexus 5X',
                'appium-version': '1.9.1',
            };
            return browser.init(caps).then(() => browser);
        };
        return builder;
    });
};

export default kobitonProvider;
