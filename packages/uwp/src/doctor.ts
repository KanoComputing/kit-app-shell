import { IDoctor } from '@kano/kit-app-shell-core/lib/types';
import { RcLoader } from '@kano/kit-app-shell-core/lib/rc';
import { CheckResultSatus } from '@kano/kit-app-shell-core/lib/check';
import chalk from 'chalk';
// import * as os from 'os';

const missingCertError = {
    status: CheckResultSatus.Failure,
    title: 'Development certificate',
    message: `Missing certificate, please run ${chalk.cyan('kash configure uwp')}`,
};

const doctor : IDoctor = {
    checks: [{
        children: [],
        run() {
            return RcLoader.loadHomeRc()
                .then((opts) => {
                    // const userInfo = os.userInfo();
                    if (!opts.uwp || !opts.uwp.certificates || !opts.uwp.certificate) {
                        return missingCertError;
                    }
                    return { status: 0, title: 'Development certificate' };
                });
        },
    }],
};

export default doctor;
