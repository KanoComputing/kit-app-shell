import { ConfigLoader } from '@kano/kit-app-shell-core/lib/config';
import { RcLoader } from '@kano/kit-app-shell-core/lib/rc';
import * as deepMerge from 'deepmerge';
import { Argv } from './options';
import { Options, KashConfig } from '@kano/kit-app-shell-core/lib/options';

function deleteCommandKeys(obj : object) : void {
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
export function agregateArgv(argv : Argv, platformId : string, command : string) {
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

export function addConfig(opts : any) : KashConfig {
    const config = ConfigLoader.load(opts.app, opts.env);
    config.BUILD_NUMBER = parseInt(process.env.BUILD_NUMBER, 10) || opts.buildNumber;
    opts.config = config;
    return opts;
}
