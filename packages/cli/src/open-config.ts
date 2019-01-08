import { promisify } from 'util';
import * as openExplorerCb from 'open-file-explorer';
import * as RcLoader from '@kano/kit-app-shell-core/lib/rc';

const openExplorer = promisify(openExplorerCb);

/**
 * Simply open the rc file
 */
export default function openConfig() {
    return openExplorer(RcLoader.RC_PATH);
};
