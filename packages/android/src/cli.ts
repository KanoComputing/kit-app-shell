import cli from '@kano/kit-app-shell-cordova/lib/cli';
import { ICli } from '@kano/kit-app-shell-core/lib/types';

// Extend cordova CLI and
const androidCli : ICli = {
    ...cli,
    group: 'Android:',
};

export default androidCli;
