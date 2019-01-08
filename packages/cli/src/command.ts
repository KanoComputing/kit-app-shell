import * as util from '@kano/kit-app-shell-core/lib/util';
import * as log from '@kano/kit-app-shell-core/lib/log';
import { agregateArgv, addConfig } from './argv';

export function runCommand(command, platformId, argv) {
    let platformCommand;
    try {
        // Load the command to run from the platform
        platformCommand = util.platform.loadPlatformKey(platformId, command);
    } catch (e) {
        return Promise.reject(e);
    }
    // Collect all the options
    return agregateArgv(argv, platformId, command)
        .then((opts) => {
            addConfig(opts);
            log.trace('OPTIONS', opts);
            // Run the command and deal with the result
            const result = platformCommand(opts);
            // Result is a thenable object return the Thenable
            // I say thenable here because maybe the platforms' 3rd party library use
            // a custom Promise library
            if (result && 'then' in result) {
                return result;
            }
            return Promise.resolve();
        });
}
