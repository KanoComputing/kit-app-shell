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

module.exports = browserstackSetup;
