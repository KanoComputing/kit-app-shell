
import * as path from 'path';
import { copy } from '@kano/kit-app-shell-core/lib/util/fs';

export function copyResources(resources : string[], dest : string, basePath : string) {
    const tasks = resources.map((file) => {
        return copy(path.join(basePath, file), path.join(dest, file));
    });
    return Promise.all(tasks);
}