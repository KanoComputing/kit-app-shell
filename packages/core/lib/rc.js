"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const os = require("os");
const deepMerge = require("deepmerge");
const util_1 = require("util");
const writeFile = util_1.promisify(fs.writeFile);
const NAMES = [
    'kit-app-shell.conf.js',
    '.kit-app-shell.conf.js',
    'kash.conf.js',
    '.kash.conf.js',
];
const RC_PATH = path.join(os.homedir(), '.kashrc.json');
exports.RcLoader = {
    check(filePath) {
        return new Promise(r => fs.access(filePath, fs.constants.F_OK, e => r(!e)));
    },
    findAll(app) {
        const resolved = [];
        const files = NAMES.map(name => path.join(app, name));
        files.push(RC_PATH);
        const tasks = files.map(filePath => exports.RcLoader.check(filePath)
            .then((exists) => {
            if (exists) {
                resolved.push(filePath);
            }
        }));
        return Promise.all(tasks).then(() => resolved);
    },
    load(app) {
        return exports.RcLoader.findAll(app)
            .then(files => files.reduce((acc, file) => deepMerge(acc, require(file)), {}))
            .then((opts) => {
            opts.tmpdir = process.env.KASH_TMP_DIR ? path.resolve(process.env.KASH_TMP_DIR) : os.tmpdir();
            return opts;
        });
    },
    hasHomeRc() {
        return exports.RcLoader.check(RC_PATH);
    },
    loadHomeRc() {
        return exports.RcLoader.hasHomeRc()
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
};
//# sourceMappingURL=rc.js.map