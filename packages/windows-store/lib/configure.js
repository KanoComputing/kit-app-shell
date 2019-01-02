const sign = require('electron-windows-store/lib/sign');
const utils = require('electron-windows-store/lib/utils');
const path = require('path');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));

const appData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library/Preferences') : '/var/local');

const appDataDir = 'kash-windows-store';
const certificatesDir = 'certificates';

function makeCert(publisher, windowsKit) {
    const program = {
        publisher,
        windowsKit,
    };
    const certFilePath = path.join(appData, appDataDir, certificatesDir);
    return mkdirp(certFilePath)
        .then(() => sign.makeCert({ publisherName: publisher, certFilePath, program }));
}

function enquireCert(prompt, config) {
    const windowsKit = config.windowsKit || utils.getDefaultWindowsKitLocation();
    let publisher;
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
                        .then(() => makeCert(publisher, windowsKit));
                }
                // User dismissed, return empty data
                return {};
            });
        }
        // No previous cert found, continue
        return makeCert(publisher, windowsKit);
    }).then(devCert => ({
        certificates: {
            [publisher]: devCert,
        },
        windowsKit,
    }));
}

module.exports = {
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
