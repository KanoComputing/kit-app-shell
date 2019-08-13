import * as path from 'path';
import * as fs from 'fs';
import * as mkdirpCb from 'mkdirp';
import { promisify } from 'util';
import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import { IKashConfig } from '@kano/kit-app-shell-core/lib/types';

const writeFile = promisify(fs.writeFile);
const mkdirp = promisify(mkdirpCb);

export function prepareApp(dest : string, config : IKashConfig) {
    const apisIndex = require.resolve('@kano/kit-app-shell-core/www/index.js');
    return mkdirp(path.join(dest, 'apis'))
        .then(() => {
            return Bundler.bundleSources(apisIndex, config, { outputFormat: { format: 'iife', name: 'KashAPIs' } });
        })
        .then((bundle) => {
            return Promise.all(bundle.map((file) => writeFile(path.join(dest, 'apis', file.fileName), file.code)));
        });
}
