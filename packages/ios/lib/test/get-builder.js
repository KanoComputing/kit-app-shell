const lib = require('./libimobiledevice');
const appium = require('appium');

/**
 * Create a local provider for iOS devices. Uses an appium server and libimobiledevice
 */
function localSetup(app, wd, mocha, opts) {
    // Start appium server
    return appium.main({ loglevel: 'error' })
    .then((server) => {
        mocha.suite.afterAll(() => {
            server.close();
        });
        // Retrieve appium port
        const { port } = server.address();
        return lib.id()
            .then((deviceIds) => {
                const [udid] = deviceIds;
                if (!udid) {
                    throw new Error('Could not run test: No connected device found');
                }
                const builder = () => {
                    const driver = wd.promiseChainRemote('0.0.0.0', port);
                    return driver.init({
                        browserName: '',
                        // Can run wihout deviceName while udid is provided
                        // But need to provide an non-empty string
                        deviceName: '-',
                        platformName: 'iOS',
                        app,
                        automationName: 'XCUITest',
                        // Pass down the found connected devices
                        udid,
                        xcodeOrgId: opts.developmentTeam,
                        xcodeSigningId: opts.codeSigningIdentity,
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
    // Remote device providers are configured in the cordova platform to be shared between iOS
    // and Android
    const builder = getBuilder(wd, mocha, opts);
    if (!builder) {
        // No provider matched, use local provider
        return localSetup(opts.prebuiltApp, wd, mocha, opts);
    }
    return builder;
};
