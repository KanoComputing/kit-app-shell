
import * as path from 'path';
import { copy } from '@kano/kit-app-shell-core/lib/util/fs';

export type IResources = Array<string | { src : string, dest : string }>;

export function copyResources(resources : IResources, dest : string, basePath : string) {
    const tasks = resources.map((res) => {
        let relativeSrc;
        let relativeDest;

        if (typeof res === 'string') {
            relativeSrc = res;
            relativeDest = res;
        } else {
            relativeSrc = res.src;
            relativeDest = res.dest;
        }
        return copy(path.join(basePath, relativeSrc), path.join(dest, relativeDest));
    });
    return Promise.all(tasks);
}