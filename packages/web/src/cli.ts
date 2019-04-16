import { ICli } from '@kano/kit-app-shell-core/lib/types';

const webCli : ICli = {
    group: 'Web: ',
    run(sywac) {
        sywac.number('--port, -p', {
            defaultValue: 4000,
        });
    },
    test(sywac) {
        sywac.string('--provider', {
            defaultValue: 'chrome',
            desc: 'Which browser provider to use',
        });
    },
};

export default webCli;
