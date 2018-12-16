const { log, processState } = require('@kano/kit-app-shell-core');
const { loadPlatformKey } = require('../lib/platform');
const { agregateArgv } = require('./argv');
const colors = require('colors/safe');

function runCommand(command, platformId, argv) {
    const platformCommand = loadPlatformKey(platformId, command);
    return agregateArgv(argv, platformId, command)
        .then(({ opts, commandOpts }) => {
            log.trace('OPTIONS', opts);
            log.trace('COMMAND OPTIONS', commandOpts);
            return new Promise((resolve) => {
                // About to start the big boy tasks. Let the process breathe and setup its CLI interface
                process.nextTick(() => {
                    const result = platformCommand(opts, commandOpts);
                    if (result && 'then' in result && 'catch' in result) {
                        result.catch(e => processState.setFailure(e))
                            .then(() => resolve());
                    } else {
                        resolve();
                    }
                });
            });
        });
}

module.exports = {
    runCommand,
};
