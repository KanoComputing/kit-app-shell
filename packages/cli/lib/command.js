const util = require('@kano/kit-app-shell-core/lib/util');
const log = require('@kano/kit-app-shell-core/lib/log');
const { agregateArgv, addConfig } = require('./argv');

function runCommand(command, platformId, argv) {
    // Load the command to run from the platform
    const platformCommand = util.platform.loadPlatformKey(platformId, command);
    // Collect all the options
    return agregateArgv(argv, platformId, command)
        .then((opts) => {
            addConfig(opts, argv.app);
            log.trace('OPTIONS', opts);
            return new Promise((resolve, reject) => {
                // Run the command and deal with the result
                const result = platformCommand(opts);
                // Resutl is a thenable object, resolve when resolves
                if (result && 'then' in result) {
                    result.then(() => resolve())
                        .catch(e => reject(e));
                } else {
                    resolve();
                }
            });
        });
}

module.exports = {
    runCommand,
};
