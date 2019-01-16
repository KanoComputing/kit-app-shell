import * as utils from 'electron-windows-store/lib/utils';
import * as path from 'path';
import { promisify } from 'util';
import * as rimrafCb from 'rimraf';
import { makeCert } from './cert';

const rimraf = promisify(rimrafCb);

const appData = process.env.APPDATA || (process.platform === 'darwin'
    ? path.join(process.env.HOME || '', 'Library/Preferences') : '/var/local');

const appDataDir = 'kash-windows-store';
const certificatesDir = 'certificates';

function enquireCert(prompt, config) {
    const windowsKit = config.windowsKit || utils.getDefaultWindowsKitLocation();
    let publisher;
    const certFilePath = path.join(appData, appDataDir, certificatesDir);
    return prompt({
        type: 'input',
        name: 'publisher',
        message: 'Enter the publisher name',
        validate: (input) => {
            if (!input.length) {
                return true;
            }
            if (!input.startsWith('CN=')) {
                return 'Publisher should start with \'CN=\'';
            }
            return true;
        },
    }).then((answers) => {
        ({ publisher } = answers);
        // Retrieve a potentially existing certificate
        const previousCert = config.certificates && config.certificates[publisher];
        // Cert already exists for this publisher, override?
        if (previousCert) {
            return prompt({
                type: 'confirm',
                name: 'confirmed',
                message: `A certificate for the publisher '${publisher}' already exist. Override?`,
            }).then((a) => {
                // User confirmed, delete previous cert then create a new one
                if (a.confirmed) {
                    return rimraf(previousCert)
                        .then(() => makeCert(publisher, certFilePath, windowsKit));
                }
                // User dismissed, return empty data
                return {};
            });
        }
        // No previous cert found, continue
        return makeCert(publisher, certFilePath, windowsKit);
    }).then((devCert) => ({
        certificates: {
            [publisher]: devCert,
        },
        windowsKit,
    }));
}

export default {
    enquire(prompt, config) {
        return prompt({
            type: 'select',
            name: 'action',
            message: 'Choose an action',
            choices: [{
                name: 'create',
                message: 'Create a new certificate',
            }],
        }).then((answers) => {
            switch (answers.action) {
            case 'create': {
                return enquireCert(prompt, config);
            }
            default: {
                return {};
            }
            }
        });
    },
};
