import { util } from '@kano/kit-app-shell-core/lib/util';
import { log } from '@kano/kit-app-shell-core/lib/log';
import { agregateArgv, addConfig } from './argv';
import { IArgv } from './types';
import { IBuild, IRun, ISign } from '@kano/kit-app-shell-core/lib/types';

type IcommandFunction = IBuild|IRun|ISign;

export default function runCommand(command : string, platformId : string, argv : IArgv) : Promise<void> {
    return util.platform.loadPlatformKey(platformId, command)
        .then((platformCommand : IcommandFunction) => {
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
        });
}
