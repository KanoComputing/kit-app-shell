import cli from '@kano/kit-app-shell-cordova/lib/cli';
import { ICli } from '@kano/kit-app-shell-core/lib/types';

const iosCli : ICli = {
    ...cli,
    group: 'iOS:',
    build(sywac) {
        sywac.option('--skip-xcodebuild', {
            aliases: ['skip-xcodebuild', 'skipXcodebuild'],
            type: 'boolean',
            desc: 'Only prepares the app but do not run xcode build.',
        });
        sywac.option('--open-xcode', {
            aliases: ['open-xcode', 'openXcode'],
            type: 'boolean',
            desc: 'Opens the Xcode project after the build succeeded',
        });
        sywac.option('--development-team [developmentTeam]', {
            aliases: ['development-team', 'developmentTeam'],
            type: 'string',
            desc: 'Development Team ID',
        });
        sywac.option('--code-sign-identity [codeSignIdentity]', {
            aliases: ['code-sign-identity', 'codeSignIdentity'],
            type: 'string',
            desc: 'Code Sign Identity',
            defaultValue: 'iPhone Developer',
        });
    },
};

export default iosCli;
