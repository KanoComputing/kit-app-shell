import { IKashConfig } from '@kano/kit-app-shell-core/lib/types';
import chalk from 'chalk';
import { IUWPBuildOptions } from './types';

export function ensureUWPConfig(config : IKashConfig) {
    if (!config.UWP) {
        throw new Error('Could not configure project, UWP key is missing in the app config');
    }
    const requiredKeys = ['PACKAGE_NAME', 'PACKAGE_DISPLAY_NAME', 'PUBLISHER', 'PUBLISHER_DISPLAY_NAME'];
    for (const key of requiredKeys) {
        if (!config.UWP[key]) {
            throw new Error(`Could not configure project, ${key} is missing in the UWP section of the app config`);
        }
    }
}

export function getCertificatePath(opts : IUWPBuildOptions) {
    ensureUWPConfig(opts.config);
    if (opts.devCert) {
        return opts.devCert;
    }
    const certificateName = opts.config.UWP.PUBLISHER;
    if (!opts.certificates || !opts.certificates[certificateName]) {
        throw new Error(`Could not get app certificate. Please run ${chalk.cyan('kash configure uwp')} and create a certificate for the publisher ${chalk.green(certificateName)}`);
    }
    return opts.certificates[certificateName];
}
