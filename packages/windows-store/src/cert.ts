import * as sign from 'electron-windows-store/lib/sign';
import * as utils from 'electron-windows-store/lib/utils';
import { promisify } from 'util';
import * as mkdirpCb from 'mkdirp';

const mkdirp = promisify(mkdirpCb);

export function makeCert(publisher : string, out : string, windowsKit? : string) : Promise<string> {
    const program = {
        publisher,
        windowsKit: windowsKit || utils.getDefaultWindowsKitLocation(),
    };
    return mkdirp(out)
        .then(() => sign.makeCert({ publisherName: publisher, certFilePath: out, program }));
}
