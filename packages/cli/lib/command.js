const { log, processState, util } = require('@kano/kit-app-shell-core');
const { agregateArgv } = require('./argv');

function runCommand(command, platformId, argv) {
    const platformCommand = util.platform.loadPlatformKey(platformId, command);
    return agregateArgv(argv, platformId, command)
        .then((opts) => {
            log.trace('OPTIONS', opts);
            return new Promise((resolve) => {
                const result = platformCommand(opts);
                if (result && 'then' in result && 'catch' in result) {
                    result.catch(e => processState.setFailure(e))
                        .then(() => resolve());
                } else {
                    resolve();
                }
            });
        });
}

module.exports = {
    runCommand,
};
