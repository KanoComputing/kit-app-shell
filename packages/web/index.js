const run = require('./lib/run');
const build = require('./lib/build');

module.exports = {
    run,
    build,
    cli(command) {
        switch (command) {
            case 'run': {
                return {
                    alias: {
                        port: ['p'],
                    },
                };
            }
            default: {
                return {};
            }
        }
    }
};
