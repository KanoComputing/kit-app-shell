const cli = require('@kano/kit-app-shell-cordova/lib/cli');

// Extend cordova CLI and
module.exports = Object.assign({}, cli, {
    group: 'Android:',
    test(sywac) {
        sywac.string('--target', {
            defaultValue: 'local',
            desc: 'Where to run the tests',
        });
    },
});
