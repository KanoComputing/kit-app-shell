import { ICli } from '@kano/kit-app-shell-core/lib/types';

const windowsStoreCli : ICli = {
    group: 'Windows Store: ',
    commands(sywac) {
        sywac.command('create-key windows-store', {

        });
    }
};

export default windowsStoreCli;
