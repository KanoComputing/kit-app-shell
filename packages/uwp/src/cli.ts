import { ICli } from '@kano/kit-app-shell-core/lib/types';
import storeCli from '@kano/kit-app-shell-windows-store/lib/cli';

const UWPCli : ICli = {
    group: 'UWP: ',
    build(sywac) {
        storeCli.build(sywac);
        sywac.option('--release', {
            type: 'boolean',
            desc: 'Builds the app in release mode',
        });
    },
    commands: storeCli.commands,
};

export default UWPCli;
