import { promisify } from 'util';
import { sign as signCb } from 'electron-osx-sign';
const sign = promisify(signCb);

/**
 * Use electron-osx-sign and pass the filename as app
 */
export default (opts) => sign({ app: opts.app });
