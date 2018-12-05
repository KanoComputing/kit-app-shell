const { run } = require('@kano/kit-app-shell-electron');
const build = require('./lib/build');

module.exports = {
    cli(command) {
        switch (command) {
            case 'build': {
                return {
                    boolean: ['skipAr'],
                };
            }
            default: {
                return {};
            }
        }
    },
    run,
    build,
};
