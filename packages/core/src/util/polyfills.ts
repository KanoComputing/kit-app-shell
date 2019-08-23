import * as path from 'path';
import { copy } from './fs';

export function copyPolyfills(scripts : string[], dest : string) {
    const tasks = scripts.map((script) => {
        const fullPath = require.resolve(script);
        const filename = path.basename(fullPath);
        return copy(fullPath, path.join(dest, filename)).then(() => filename);
    });
    return Promise.all(tasks);
}

export function generateElements(names : string[]) {
    return names.map((name) => `<script src="/${name}"></script>`).join('');
}
