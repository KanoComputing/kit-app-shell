import { ICli } from '@kano/kit-app-shell-core/lib/types';
import { makeCert } from './cert';

const windowsStoreCli : ICli = {
    group: 'Windows Store: ',
    commands(sywac) {
        sywac.command('create-key windows-store', {
            desc: 'Create a signing key for a given publisher',
            setup: (sywac) => {
                sywac.option('-p, --publisher <publisher>', {
                    type: 'string',
                    desc: 'Name of the publisher. e.g. CN=Fabrikam',
                    required: true,
                });
                sywac.option('-o, --out <out>', {
                    required: true,
                    type: 'string',
                    desc: 'Path to the created cert',
                });
            },
            run: (argv) => {
                return makeCert(argv.publisher, argv.out);
            },
        });
    },
    build(sywac) {
        sywac.option('-d, --dev-cert [devCert]', {
            aliases: ['d', 'dev-cert', 'devCert'],
            type: 'string',
            desc: 'Path to a developer certificate to sign the .appx package',
        });
        sywac.option('-k, --windows-kit [windowsKit]', {
            aliases: ['k', 'windows-kit', 'windowsKit'],
            type: 'string',
            desc: 'Path to the Windows 10 SDK binaries',
        });
    }
};

export default windowsStoreCli;
