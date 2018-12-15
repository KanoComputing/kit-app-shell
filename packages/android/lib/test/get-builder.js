const appium = require('appium');
const adbkit = require('adbkit');
const build = require('../build');
const path = require('path');
const os = require('os');
const { upload, HUB_URL } = require('@kano/kit-app-shell-browserstack');

function browserstackSetup(app, wd, mocha, opts, commandOpts) {
    const { browserstackOptions } = commandOpts;
    if (!browserstackOptions) {
        throw new Error(`Could not run test on browserstack: Missing 'browserstackOptions' in your rc file`);
    }
    const { user, key } = browserstackOptions;
    return upload(app, {
        user,
        key,
    }).then(({ app_url }) => {
        const builder = (test) => {
            const driver = wd.promiseChainRemote(HUB_URL);
            return driver.init({
                // TODO: parametrize this
                platformName: 'Android',
                device: 'Google Nexus 6',
                os_version: '6.0',
                'browserstack.user': user,
                'browserstack.key' : key,
                build : `${opts.config.APP_NAME} v${opts.config.UI_VERSION} Android`,
                name: test.fullTitle(),
                app : app_url,
                autoWebview: true,
            }).then(() => driver);
        };
        return builder;
    });
}

function localSetup(app, wd, mocha, opts, commandOpts) {
    return appium.main({ loglevel: 'error' })
        .then((server) => {
            mocha.suite.afterAll(() => {
                server.close();
            });
            // Retrieve appium port
            const { port } = server.address();
            const client = adbkit.createClient();
            return client.listDevices()
                .then((devices) => {
                    const [device] = devices;
                    if (!device) {
                        throw new Error('Could not run test: No connected device found');
                    }
                    const builder = () => {
                        const driver = wd.promiseChainRemote('0.0.0.0', port);
                        return driver.init({
                            platformName: 'Android',
                            deviceName: '-',
                            browserName: 'Android',
                            autoWebview: true,
                            udid: device.id,
                            app,
                        }).then(() => driver);
                    }
                    return builder;
                })
                .catch((e) => {
                    server.close();
                    throw e;
                });
            });
}

/**
 * Create a builder to create a driver for each test
 */
module.exports = (wd, mocha, opts, commandOpts) => {
    const TMP_OUT = path.join(os.tmpdir(), 'kash-android-test');
    return build(Object.assign({}, opts, { out: TMP_OUT }), commandOpts)
        .then((app) => {
            if (commandOpts.browserstack) {
                return browserstackSetup(app, wd, mocha, opts, commandOpts);
            }
            return localSetup(app, wd, mocha, opts, commandOpts);
        });
};
