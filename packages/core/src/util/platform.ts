import { Sywac, IBuild, IRun, IBuilderFactory, ISign, IConfigure, ICli, ICommand, IDoctor } from '../types';

export type IPlatformPart = IBuild|IRun|ISign|IBuilderFactory|IConfigure|ICli|IDoctor;

// Loads a platform sub-module
// This allows us to load just the CLI config and only the required command
// This speeds up the overall CLI by skipping eventual dependencies
// that will never run for a session,
// e.g. Do not load heavy testing frameworks when we only need to run the app
// The default location is lib/<key>
export function loadPlatformKey(name : string, key : string, ignoreError? : boolean) : Promise<IPlatformPart|null> {
    if (name === 'core' || name === 'cli') {
        return Promise.reject(new Error(`Could not load platform: '${name}' is reserved`));
    }
    return import(`@kano/kit-app-shell-${name}/lib/${key}`)
        .then((imported : { default : IPlatformPart }) => {
            return imported.default;
        })
        .catch((originalError) => {
            // Sometimes we don't want a hard fail on a missing method
            if (ignoreError) {
                return null;
            }
            // Could not find the specific file. Need to figure out if the platform is not installed
            // Or doesn't implement that file
            // Use require.resolve here to avoid loading the whole module
            let modulePath;
            try {
                modulePath = require.resolve(`@kano/kit-app-shell-${name}/package.json`);
            } catch (e) {}
            if (modulePath) {
                throw new Error(`Platform '${name}' does not implement '${key}'`);
            } else {
                // Failed to resolve the module, it is not installed
                if (originalError.code === 'MODULE_NOT_FOUND') {
                    throw new Error(`Could not load platform: '${name}' was not installed`);
                }
                throw originalError;
            }
        });
}

export function registerCommands(sywac : Sywac, platform : { cli? : ICli }) {
    // Ignore missing cli
    if (!platform.cli) {
        return;
    }
    // Ignore missing or wrongly typed commands config
    if (typeof platform.cli.commands !== 'function') {
        return;
    }
    platform.cli.commands(sywac);
}

export function registerOptions(sywac : Sywac, platform : { cli? : ICli }, command : ICommand) {
    // Ignore missing cli
    if (!platform.cli) {
        return;
    }
    // Fetch the function that will regiter options for a given command
    const optionsRegistration = platform.cli[command];

    if (typeof optionsRegistration !== 'function') {
        return;
    }
    optionsRegistration(sywac);
}
