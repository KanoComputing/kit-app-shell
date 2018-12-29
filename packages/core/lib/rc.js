const path = require('path');
const fs = require('fs');
const os = require('os');
const deepMerge = require('deepmerge');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

const NAMES = [
    'kit-app-shell.conf.js',
    '.kit-app-shell.conf.js',
    'kash.conf.js',
    '.kash.conf.js',
];

const RC_PATH = path.join(os.homedir(), '.kashrc.json');

const RcLoader = {
    check(filePath) {
        // Use fs.access to test if file exists. resolve with a boolean
        return new Promise((r) => fs.access(filePath, fs.F_OK, e => r(!e)));
    },
    findAll(app) {
        const resolved = [];
        const files = NAMES.map((name) => path.join(app, name));
        files.push(RC_PATH);
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
                    return deepMerge(acc, require(file));
                }, {});
            });
    },
    hasHomeRc() {
        return RcLoader.check(RC_PATH);
    },
    loadHomeRc() {
        return RcLoader.hasHomeRc()
            .then((exists) => {
                if (!exists) {
                    return {};
                }
                return require(RC_PATH);
            });
    },
    saveHomeRc(contents) {
        return writeFile(RC_PATH, JSON.stringify(contents, null, '    '));
    },
    RC_PATH,
}

module.exports = RcLoader;