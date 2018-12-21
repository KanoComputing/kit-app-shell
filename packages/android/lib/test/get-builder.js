const appium = require('appium');
const adbkit = require('adbkit');
const url = require('url');
const { processState } = require('@kano/kit-app-shell-core');

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
    switch (opts.target) {
        case 'saucelabs': {
            return require('./saucelabs')(opts.prebuiltApp, wd, mocha, opts);
        }
        case 'bitbar': {
            return require('./bitbar')(opts.prebuiltApp, wd, mocha, opts);
        }
        case 'browserstack': {
            return browserstackSetup(opts.prebuiltApp, wd, mocha, opts);
        }
        default: {
            return localSetup(opts.prebuiltApp, wd, mocha, opts);
        }
    }
};
