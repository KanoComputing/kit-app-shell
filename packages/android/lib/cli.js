const cli = require('@kano/kit-app-shell-cordova/lib/cli');

// Extend cordova CLI and
module.exports = Object.assign({}, cli, {
    group: 'Android:',
    test(sywac) {
        sywac.boolean('--browserstack', {
            defaultValue: false,
            desc: 'Run the tests on browserstack',
        });
        sywac.boolean('--saucelabs', {
            defaultValue: false,
            desc: 'Run the tests on saucelabs',
        });
    },
});
