const appium = require('appium');
const adbkit = require('adbkit');
const url = require('url');
const { processState } = require('@kano/kit-app-shell-core/lib/process-state');
const getBuilder = require('@kano/kit-app-shell-cordova/lib/test/get-builder');

/**
 * Local device provider for android apps. Uses a local appium server and adb to find devices
 */
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
                    return client.uninstall(device.id, opts.config.APP_ID).then(() => device);
                })
                .then((device) => {
                    const builder = () => {
                        // Create driver with required capabilities
                        const driver = wd.promiseChainRemote('0.0.0.0', port);
                        return driver.init({
                            platformName: 'Android',
                            // Required to be non-empty, but is irrelevant
                            deviceName: '-',
                            browserName: 'Android',
                            // autoWebview: true,
                            // Id of the device found
                            udid: device.id,
                            // Path to the prebuilt app
                            app,
                        }).then(() => driver);
                    };
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
    // Replace refresh method to prevent android from opening a browser
    wd.addAsyncMethod(
        'refresh',
        function refresh(cb) {
            // Get the current URL
            this.url((err, contextUrl) => {
                if (err) {
                    return cb(err);
                }
                // Parse and rebuild the original content URL
                const parsed = url.parse(contextUrl);
                return this.get(`${parsed.protocol}//${parsed.host}/index.html`, cb);
            });
        },
    );
    if (opts.provider === 'local') {
        return localSetup(opts.prebuiltApp, wd, mocha, opts);
    }
    // Remote device providers are configured in the cordova platform to be shared between iOS
    // and Android
    const builder = getBuilder(wd, mocha, opts);
    if (!builder) {
        throw new Error(`Could not run tests: '${opts.provider}' is not a valid device provider`);
    }
    return builder;
};
