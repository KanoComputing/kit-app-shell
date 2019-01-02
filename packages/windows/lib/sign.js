const processState = require('@kano/kit-app-shell-core/lib/process-state');
const path = require('path');
const cp = require('child_process');

module.exports = function sign(opts) {
    processState.setInfo(`Signing app ${opts.app} for windows`);
    return new Promise((resolve, reject) => {
        const p = cp.spawn(path.join(__dirname, 'sign.bat'), [opts.app], { stdio: 'inherit' });

        p.on('error', e => reject(e));
        p.on('exit', (code) => {
            if (parseInt(code, 10) !== 0) {
                return reject(new Error(`Could not sign ${opts.app}: Signtool returned a non zero exit code: ${code}`));
            }
            processState.setSuccess(`App ${opts.app} signed`);
            return resolve();
        });
    });
};
