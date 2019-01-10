import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as deepMerge from 'deepmerge';
import { promisify } from 'util';
import { BuildOptions, Options } from './types';

const writeFile = promisify(fs.writeFile);

const NAMES = [
    'kit-app-shell.conf.js',
    '.kit-app-shell.conf.js',
    'kash.conf.js',
    '.kash.conf.js',
];

const RC_PATH = path.join(os.homedir(), '.kashrc.json');

export const RcLoader = {
    check(filePath : string) : Promise<boolean> {
        // Use fs.access to test if file exists. resolve with a boolean
        return new Promise(r => fs.access(filePath, fs.constants.F_OK, e => r(!e)));
    },
    findAll(app : string) : Promise<Array<string>> {
        const resolved : Array<string> = [];
        const files = NAMES.map(name => path.join(app, name));
        files.push(RC_PATH);
        const tasks = files.map(filePath => RcLoader.check(filePath)
            .then((exists) => {
                if (exists) {
                    resolved.push(filePath);
                }
            }));
        return Promise.all(tasks).then(() => resolved);
    },
    load(app : string) : Promise<Options> {
        return RcLoader.findAll(app)
            .then(files => files.reduce((acc, file) => deepMerge(acc, require(file)), {}))
            .then((opts : BuildOptions) => {
                // Get the defined temporary directory or use the system one
                opts.tmpdir = process.env.KASH_TMP_DIR ? path.resolve(process.env.KASH_TMP_DIR) : os.tmpdir();
                return opts;
            });
    },
    hasHomeRc() : Promise<boolean> {
        return RcLoader.check(RC_PATH);
    },
    loadHomeRc() : Promise<Options> {
        return RcLoader.hasHomeRc()
            .then((exists) => {
                if (!exists) {
                    return {};
                }
                return require(RC_PATH);
            });
    },
    saveHomeRc(contents : any) : Promise<void> {
        return writeFile(RC_PATH, JSON.stringify(contents, null, '    '));
    },
    RC_PATH,
};
