const cli = require('@kano/kit-app-shell-cordova/lib/cli');

module.exports = Object.assign({}, cli, {
    group: 'iOS:',
    test(sywac) {
        sywac.boolean('--browserstack', {
            defaultValue: false,
            desc: 'Run the tests on browserstack',
        });
    },
});
