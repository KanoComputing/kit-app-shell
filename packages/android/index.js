const { cli } = require('@kano/kit-app-shell-cordova');
const build = require('./lib/build');
const run = require('./lib/run');
const getBuilder = require('./lib/test/get-builder');

module.exports = {
    cli(command) {
        const parentOptions = cli(command);
        switch(command) {
            case 'test': {
                return Object.assign({
                    default: { browserstack: false },
                    boolean: ['browserstack']
                }, parentOptions);
            }
            default: {
                return parentOptions;
            }
        }
    },
    run,
    build,
    getBuilder,
};
