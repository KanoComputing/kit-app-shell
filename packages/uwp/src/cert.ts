import * as os from 'os';
import { IProjectOptions } from './project';

export function getDevCertPath(opts : IProjectOptions) : string|null {
    const userInfo = os.userInfo();
    const { username } = userInfo;
    if (!opts.certificates || !opts.certificates[username]) {
        return null;
    }
    return opts.certificates[username];
}
