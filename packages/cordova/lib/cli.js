module.exports = {
    commands(yargs) {
        yargs.option('cache', {
            type: 'boolean',
            default: true,
            describe: 'Uses cached cordova project to speed up builds. Use --no-cache to build the project every time',
        });
    },
    build(yargs) {
        yargs.option('run', {
            type: 'boolean',
            default: false,
            describe: 'Runs the app after building on an available connected device',
        });
    }
};
