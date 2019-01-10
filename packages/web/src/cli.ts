import { ICli } from '@kano/kit-app-shell-core/lib/types';

const webCli : ICli = {
    group: 'Web: ',
    run(sywac) {
        sywac.number('--port, -p', {
            defaultValue: 4000,
        });
    },
};

export default webCli;
