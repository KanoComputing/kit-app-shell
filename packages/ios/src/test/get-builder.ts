import * as lib from './libimobiledevice';
import * as appium from 'appium';
import getBuilder from '@kano/kit-app-shell-cordova/lib/test/get-builder';
import { IBuilderFactory } from '@kano/kit-app-shell-core/lib/types';

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
                            xcodeSigningId: opts.codeSignIdentity,
                            startIWDP: true,
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
const getIosBuilder : IBuilderFactory = (wd, mocha, opts) => {
    // Use local provider
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


export default getIosBuilder;