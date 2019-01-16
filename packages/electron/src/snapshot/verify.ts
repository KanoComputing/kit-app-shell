import * as vm from 'vm';

export function verify(source : string, scriptPath : string) {
    vm.runInNewContext(source, undefined, { filename: scriptPath, displayErrors: true });
}
