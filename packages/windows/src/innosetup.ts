/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Taken from https://github.com/Microsoft/vscode/blob/8ddcdbfa954f7561e8e23d229853aedc70e32a4c/build/gulpfile.vscode.win32.js
// And adapted with some of the node-innosetup npm module

import * as path from 'path';
import * as assert from 'assert';
import * as cp from 'child_process';

let innoSetupPath = path.join(path.dirname(path.dirname(require.resolve('innosetup-compiler'))), 'bin', 'ISCC.exe');

function packageInnoSetup(iss, options, cb) {
    options = options || {};

    const definitions = options.definitions || {};
    const keys = Object.keys(definitions);

    keys.forEach(key => assert(typeof definitions[key] === 'string', `Missing value for '${key}' in Inno Setup package step`));

    const defs = keys.map(key => `/d${key}=${definitions[key]}`);
    const args = [iss].concat(defs);

    if (!(options && options.verbose)) {
        args.push('/q');
    }
    if (options && options.signtoolname && options.signtoolcommand) {
        args.push(`/S${options.signtoolname}=${options.signtoolcommand.replace(/['"]/g, '$q')}`);
    }

    if (options) {
        // reset pre-processed options
        delete options.gui;
        delete options.verbose;
        delete options.signtoolname;
        delete options.signtoolcommand;

        // cycle all other options and add it to args
        Object.keys(options).forEach((key) => {
            const val = options[key];
            if (/^D/.test(key)) {
                args.push(`/${key}=${val}`);
            } else {
                args.push(`/${key}${val}`);
            }
        });
    }

    if (!/^win/.test(process.platform)) {
        args.unshift(innoSetupPath);
        innoSetupPath = 'wine';
    }

    cp.spawn(innoSetupPath, args, { stdio: 'inherit' })
        .on('error', cb)
        .on('exit', () => cb(null));
}

export function buildWin32Setup(opts, cb) {
    packageInnoSetup(opts.iss, opts, cb);
}
