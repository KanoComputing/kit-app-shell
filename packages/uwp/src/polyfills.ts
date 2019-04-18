import * as path from 'path';
import { util } from '@kano/kit-app-shell-core/lib/util';

export function copyPolyfills(dest : string) {
    const scripts = [
        '@webcomponents/webcomponentsjs/webcomponents-bundle.js',
        '@webcomponents/shadycss/scoping-shim.min.js',
        'text-encoding/lib/encoding.js',
        'text-encoding/lib/encoding-indexes.js',
    ];

    const tasks = scripts.map((script) => {
        const fullPath = require.resolve(script);
        const filename = path.basename(fullPath);
        return util.fs.copy(fullPath, path.join(dest, filename)).then(() => filename);
    });
    return Promise.all(tasks);
}
