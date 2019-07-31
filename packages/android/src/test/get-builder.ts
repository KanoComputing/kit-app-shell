import * as appium from 'appium';
import * as adbkit from 'adbkit';
import * as url from 'url';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { getPathOrDownload } from '@kano/kit-app-shell-core/lib/util/resource';
import { getCachePath } from '@kano/kit-app-shell-core/lib/tmp';
import getBuilder from '@kano/kit-app-shell-cordova/lib/test/get-builder';
import { Builder, IBuilderFactory } from '@kano/kit-app-shell-core/lib/types';
import { switchContexts } from '@kano/kit-app-shell-test/lib/switch-context';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function retrieveApp(app : string, tmpDir : string) {
    processState.setStep('Fetching app');
    return getPathOrDownload(app, tmpDir)
        .then((appPath) => {
            processState.setSuccess('Found target app');
            return appPath;
        });
}

function getAppId(app : string) {
    return execAsync(`aapt d badging ${app}`)
        .then((d) => {
            const pkgNameReg = /package: name='(.+?)'/;
            const match = d.stdout.match(pkgNameReg);
            if (!match || !match[1]) {
                throw new Error('Could not extract package name from aapt dump');
            }
            return match[1];
        });
}

/**
 * Local device provider for android apps. Uses a local appium server and adb to find devices
 */
function localSetup(app : string, wd, ctx, opts) : Promise<Builder> {
    return retrieveApp(app, getCachePath())
        .then((appPath) => {
            return getAppId(appPath)
                .then((appId) => {
                    processState.setStep('Starting appium server');

                    // Start appium server
                    return appium.main({ loglevel: 'error', chromedriverExecutable: 'C:\\Users\\Paul\\Downloads\\chromedriver.exe' })
                        .then((server) => {
                            processState.setSuccess('Appium server started');
                            ctx.afterAll(() => {
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
                                    return client.uninstall(device.id, appId).then(() => device);
                                })
                                .then((device) => {
                                    const builder : Builder = () => {
                                        // Create driver with required capabilities
                                        const driver = wd.promiseChainRemote('0.0.0.0', port);
                                        ctx.beforeEach(() => {
                                            return driver.resetApp()
                                                .then(() => switchContexts(wd, driver, 1))
                                                // Force load the automated url
                                                .then(() => driver.url())
                                                .then((contextUrl) => {
                                                    const parsed = url.parse(contextUrl);
                                                    return driver.get(`${parsed.protocol}//${parsed.host}/index.html?__kash_automated__`);
                                                });
                                        });
                                        ctx.afterEach(() => {
                                            return switchContexts(wd, driver, 0);
                                        });
                                        return driver.init({
                                            platformName: 'Android',
                                            // Required to be non-empty, but is irrelevant
                                            deviceName: '-',
                                            browserName: 'Android',
                                            // Id of the device found
                                            udid: device.id,
                                            // Path to the prebuilt app
                                            app: appPath,
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
        });
}
/**
 * Create a builder to create a driver for each test
 */
const getAndroidBuilder : IBuilderFactory = (wd, ctx, opts) : Promise<Builder> => {
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
        return localSetup(opts.prebuiltApp, wd, ctx, opts);
    }
    // Remote device providers are configured in the cordova platform to be shared between iOS
    // and Android
    return getBuilder(wd, ctx, opts)
        .then((builder) => {
            if (!builder) {
                throw new Error(`Could not run tests: '${opts.provider}' is not a valid device provider`);
            }
            return builder;
        });
};

export default getAndroidBuilder;
