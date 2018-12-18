const lib = require('./libimobiledevice');
const appium = require('appium');
const { upload, HUB_URL } = require('@kano/kit-app-shell-browserstack');

function browserstackSetup(app, wd, mocha, opts) {
    const { browserstackOptions } = opts;
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
                device: 'iPhone 8 Plus',
                os_version: '11.0',
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

function localSetup(wd, mocha, opts) {
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
                        autoWebview: true,
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

module.exports = (wd, mocha, opts) => {
    if (opts.browserstack) {
        return browserstackSetup(opts.prebuiltApp, wd, mocha, opts);
    }
    return localSetup(opts.prebuiltApp, wd, mocha, opts);
};
