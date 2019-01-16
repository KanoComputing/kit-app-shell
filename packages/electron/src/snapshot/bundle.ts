import * as fs from 'fs';
import * as os from 'os';
import * as rollup from 'rollup';
import * as path from 'path';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as mkdirpCb from 'mkdirp';
import * as commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import { replace } from '@kano/kit-app-shell-core/lib/plugins/replace';
import { promisify } from 'util';

const mkdirp = promisify(mkdirpCb);
const writeFile = promisify(fs.writeFile);

const dirname = (root) => ({
    name: 'dirname',
    transform: (code, id) => {
        return code.replace(/__dirname/g, () => {
            const rel = path.relative(root, path.dirname(id));
            return `path.resolve(__dirname, \`${rel.replace(/\\/g, '/')}\`)`;
        });
    },
});

interface IBundleOptions {
    platform? : string;
    ignore? : string[];
}

const DEFAULT_REPLACEMENTS = {
    // UWP hack
    ["const uwpRoot = '../uwp/';"]: "const uwpRoot = './node_modules/noble-uwp/uwp/';",
    // jszip
    'support.nodestream': 'true',
    ["exports.nodestream = !!require('readable-stream').Readable;"]: 'exports.nodestream = true;',
    // Readable stream hack
    'process.env.READABLE_STREAM': "'disable'",
    ["('readable-stream')"]: "('stream')",
    // Unhack browserify
    ["'mv' + ''"]: "'mv'",
    ["'dtrace-provider' + ''"]: "'dtrace-provider'",
    ["'source-map-support' + ''"]: "'source-map-support'",
};

export function bundle(input : string, opts : IBundleOptions) {
    const replacements = {
        ...DEFAULT_REPLACEMENTS,
    };
    // If a platform is provided, hardcode it
    if (opts.platform) {
        Object.assign(replacements, {
            'process.platform': `'${opts.platform}'`,
            'os.platform()': `'${opts.platform}'`,
            'process.env.GRACEFUL_FS_PLATFORM': `'${opts.platform}'`,
        });
    }
    return rollup.rollup({
        input,
        plugins: [
            json(),
            nodeResolve({
                preferBuiltins: false,
            }),
            replace({
                delimiters: ['', ''],
                values: replacements,
            }),
            dirname(path.dirname(input)),
            commonjs({
                ignore: ['util', 'electron'].concat(opts.ignore || []),
            }),
        ],
        onwarn: () => null,
    })
        .then((b) => b.generate({ format: 'cjs' }))
        // @ts-ignore
        .then(({ output }) => {
            const [main] = output;
            const tmpOut = path.join(os.tmpdir(), 'snapshot');
            const tmpOutFile = path.join(tmpOut, 'bundle.js');
            return mkdirp(tmpOut)
                .then(() => writeFile(tmpOutFile, main.code, 'utf-8'))
                .then(() => tmpOutFile);
        });
}
