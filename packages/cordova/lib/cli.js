module.exports = {
    commands(sywac) {
        sywac.boolean('--no-cache', {
            defaultValue: false,
            desc: 'Create a new cordova project for this build',
        });
    },
    build(sywac) {
        sywac.boolean('--run', {
            defaultValue: false,
            desc: 'Runs the app after building on an available connected device',
        });
    }
};
