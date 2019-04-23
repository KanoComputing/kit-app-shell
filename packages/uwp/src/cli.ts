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
        sywac.option('--project-only', {
            aliases: ['project-only', 'projectOnly'],
            type: 'boolean',
            desc: 'Do not build the app, just create the project',
        });
    },
    configure: storeCli.configure,
    commands: storeCli.commands,
};

export default UWPCli;
