const ConfigLoader = require('@kano/kit-app-shell-core/lib/config');
const RcLoader = require('@kano/kit-app-shell-core/lib/rc');
const deepMerge = require('deepmerge');

function deleteCommandKeys(obj) {
    [
        'build',
        'run',
        'test',
    ].forEach((key) => {
        delete obj[key];
    });
}

/**
 * Collect all options into one object
 * Merges the data following this rule:
 * rc <= rc-cmd <= rc-platform <= rc-platform-cmd <= opts
 *
 *  - Given opts
 *  - Platform command options ( Configures a command for a specific platform )
 * {
 *     "web": {
 *         "build": {...}
 *     }
 * }
 *  - Platform options ( Configures options shared across all command for a platform )
 * {
 *     "web": {...}
 * }
 *  - Command options ( Configures options shared across all platforms for a command )
 * {
 *     "build": {...}
 * }
 *  - Global options ( Configures options for all command and all platforms )
 * {
 *     ...
 * }
 *
 * @param {Object} argv Arguments received from the CLI
 * @param {String} platformId Which platform the command should run with
 * @param {String} command The command parsed from the CLI
 */
function agregateArgv(argv, platformId, command) {
    // Load config files
    return RcLoader.load(argv.app)
        .then((rcOpts) => {
            // Options specific to the platform defined in the config file
            const rcPlatformOpts = rcOpts[platformId] || {};
            // Remove the platform key from the rc options
            delete rcOpts[platformId];
            // Collect the command options form the rc platform data
            const rcPlatformCommandOpts = rcPlatformOpts[command] || {};
            // Remove command keys from the platform object in the rc data
            deleteCommandKeys(rcPlatformOpts);
            const rcCommandOpts = rcOpts[command] || {};
            // Remove the command keys from the rc data itself
            deleteCommandKeys(rcOpts);
            const allOpts = [
                rcOpts,
                rcCommandOpts,
                rcPlatformOpts,
                rcPlatformCommandOpts,
                argv,
            ];
            const opts = allOpts.reduce((acc, item) => deepMerge(acc, item), {});
            return opts;
        });
}

function addConfig(opts) {
    const config = ConfigLoader.load(opts.app, opts.env);
    config.BUILD_NUMBER = parseInt(process.env.BUILD_NUMBER, 10) || opts.buildNumber;
    opts.config = config;
    return opts;
}

module.exports = {
    agregateArgv,
    addConfig,
};
