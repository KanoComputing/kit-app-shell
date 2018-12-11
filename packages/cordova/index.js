const run = require('./lib/run');
const build = require('./lib/build');
const util = require('./lib/util');
const xml = require('./lib/xml');
const project = require('./lib/project');

module.exports = {
    cli(command) {
        switch(command) {
            case 'build': {
                return {
                    default: {
                        cache: true,
                        run: false,
                    },
                    boolean: ['cache', 'run'],
                };
            }
            default: {
                return {
                    default: {
                        cache: true,
                    },
                    boolean: ['cache'],
                };
            }
        }
    },
    run,
    build,
    util,
    xml,
    project,
};
