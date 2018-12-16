const { ConfigLoader, RcLoader } = require('@kano/kit-app-shell-core');
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

function agregateArgv(argv, platformId, command) {
    const config = ConfigLoader.load(argv.app, argv.env);
    config.BUILD_NUMBER = parseInt(process.env.BUILD_NUMBER, 10) || argv.buildNumber;
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
                rcPlatformOpts,
                rcCommandOpts,
                rcPlatformCommandOpts,
            ];
            const commandOpts = allOpts.reduce((acc, item) => {
                return deepMerge(acc, item);
            }, {});
            argv.config = config;
            return {
                opts: argv,
                commandOpts,
            };
        });
}

module.exports = {
    agregateArgv,
};
