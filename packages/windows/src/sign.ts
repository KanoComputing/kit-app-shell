import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { ISignOptions } from '@kano/kit-app-shell-core/lib/types';
import * as path from 'path';
import { spawn } from 'child_process';

export default function sign(opts : ISignOptions) {
    processState.setInfo(`Signing app ${opts.app} for windows`);
    return new Promise((resolve, reject) => {
        const p = spawn(path.join(__dirname, '../sign.bat'), [opts.app], { stdio: 'inherit' });

        p.on('error', (e) => reject(e));
        p.on('exit', (code) => {
            if (code !== 0) {
                return reject(new Error(`Could not sign ${opts.app}: Signtool returned a non zero exit code: ${code}`));
            }
            processState.setSuccess(`App ${opts.app} signed`);
            return resolve();
        });
    });
}
