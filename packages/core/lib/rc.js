const path = require('path');
const fs = require('fs');
const os = require('os');

const NAMES = [
    'kit-app-shell.conf.js',
    '.kit-app-shell.conf.js',
    'kash.conf.js',
    '.kash.conf.js',
];

const RcLoader = {
    check(filePath) {
        // Use fs.access to test if file exists. resolve with a boolean
        return new Promise((r) => fs.access(filePath, fs.F_OK, e => r(!e)));
    },
    findAll(app) {
        const resolved = [];
        const files = NAMES.map((name) => path.join(app, name));
        files.push(path.join(os.homedir(), '.kashrc.json'));
        const tasks = files.map((filePath) => {
            return RcLoader.check(filePath)
                .then((exists) => {
                    if (exists) {
                        resolved.push(filePath);
                    }
                });
        });
        return Promise.all(tasks).then(() => resolved);
    },
    load(app) {
        return RcLoader.findAll(app)
            .then((files) => {
                return files.reduce((acc, file) => {
                    Object.assign(acc, require(file));
                    return acc;
                }, {});
            });
    }
}

module.exports = RcLoader;
