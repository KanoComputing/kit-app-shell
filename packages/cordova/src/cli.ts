import { ICli } from '@kano/kit-app-shell-core/lib/types';

const cordovaCli : ICli = {
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
        sywac.boolean('--release', {
            defaultValue: false,
            desc: 'Builds the application for distribution',
        });
    },
    test(sywac) {
        sywac.string('--provider', {
            defaultValue: 'local',
            desc: 'Which device provider to use',
        });
    },
};

export default cordovaCli;
