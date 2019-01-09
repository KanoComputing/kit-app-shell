import cli from '@kano/kit-app-shell-cordova/lib/cli';

export default Object.assign({}, cli, {
    group: 'iOS:',
    test(sywac) {
        sywac.boolean('--browserstack', {
            defaultValue: false,
            desc: 'Run the tests on browserstack',
        });
    },
});
