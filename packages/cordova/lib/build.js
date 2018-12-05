const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const { cordova } = require('cordova-lib');
function runCdv(cmd, root) {
    return new Promise((resolve, reject) => {
        const cdv = spawn('cordova', cmd.split(' '), { cwd: root });

        let errStack = '';

        cdv.stderr.on('data', (chunk) => {
            errStack += chunk.toString();
        });

        cdv.on('close', (code) => {
            const intCode = parseInt(code, 10);
            if (code !== 0) {
                return reject(new Error(errStack));
            }
            return resolve();
        });
    });
}


module.exports = ({ app, config = {}, out }, {}) => {
    const TMP_DIR = path.join(os.tmpdir(), 'kash-cordova-build');
    const PROJECT_DIR = path.join(TMP_DIR, 'project');

    rimraf.sync(TMP_DIR);
    mkdirp.sync(TMP_DIR);

    // TODO: Use cordova template!!!!! This is amazing
    return cordova.create(PROJECT_DIR, 'com.kano.pleaseimplement', 'App')
        .then(() => cordova.add('add', ['android']))
        .then(() => {
            console.log(TMP_DIR);
        });
};
