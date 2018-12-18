const appium = require('appium');
const adbkit = require('adbkit');
const url = require('url');
const { processState } = require('@kano/kit-app-shell-core');
const { upload, HUB_URL } = require('@kano/kit-app-shell-browserstack');

function browserstackSetup(app, wd, mocha, opts) {
    // Retrieve browserstack options
    const { browserstackOptions } = opts;
    // Authentication options are required, throw an error
    if (!browserstackOptions) {
        // Be explicit enough so peopoe know what to do next
        throw new Error(`Could not run test on browserstack: Missing 'browserstackOptions' in your rc file`);
    }
    const { user, key } = browserstackOptions;
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

function localSetup(app, wd, mocha, opts) {
    processState.setStep('Starting appium server');
    // Start appium server
    return appium.main({ loglevel: 'error' })
        .then((server) => {
            processState.setSuccess('Appium server started');
            mocha.suite.afterAll(() => {
                server.close();
            });
            processState.setStep('Looking for testing device');
            // Retrieve appium port
            const { port } = server.address();
            // Create adb client to find a local device and uninstall apps with conflicting id
            const client = adbkit.createClient();
            return client.listDevices()
                .then((devices) => {
                    const [device] = devices;
                    if (!device) {
                        throw new Error('Could not run test: No connected device found');
                    }
                    processState.setSuccess(`Found testing device: ${device.id}`);
                    // TODO: Unify values from the config and use default APP_ID
                    return client.uninstall(device.id, opts.config.APP_ID || 'io.cordova.hellocordova').then(() => device);
                })
                .then((device) => {
                    const builder = () => {
                        // Replace refresh method to prevent android from opening a browser
                        wd.addAsyncMethod(
                            'refresh',
                            function(cb) {
                                // Get the current URL
                                this.url((err, contextUrl) => {
                                    if (err) {
                                        return cb(err);
                                    }
                                    // Parse and rebuild the original content URL
                                    const parsed = url.parse(contextUrl);
                                    this.get(`${parsed.protocol}//${parsed.host}/index.html`, cb);
                                });
                            }
                        );
                        // Create driver with required capabilities
                        const driver = wd.promiseChainRemote('0.0.0.0', port);
                        return driver.init({
                            platformName: 'Android',
                            // Required to be non-empty, but is irrelevant
                            deviceName: '-',
                            browserName: 'Android',
                            autoWebview: true,
                            // Id of the device found
                            udid: device.id,
                            // Path to the prebuilt app
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
module.exports = (wd, mocha, opts) => {
    // Use either browserstack or a local device for testing
    if (opts.browserstack) {
        return browserstackSetup(opts.prebuiltApp, wd, mocha, opts);
    }
    return localSetup(opts.prebuiltApp, wd, mocha, opts);
};
