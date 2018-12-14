const lib = require('./libimobiledevice');
const appium = require('appium');
const path = require('path');
const os = require('os');
const build = require('../build');

module.exports = (wd, opts, commandOpts) => {
    const TMP_OUT = path.join(os.tmpdir(), 'kash-ios-test');
    return build(Object.assign({}, opts, { out: TMP_OUT }), commandOpts)
        .then((app) => {
            // Start appium server
            return appium.main({ loglevel: 'error' })
                .then((server) => {
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
                                    xcodeOrgId: commandOpts.developmentTeam,
                                    xcodeSigningId: commandOpts.codeSigningIdentity,
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
        });
};
