import { spawn, ChildProcess } from 'child_process';

const edgeDriverPath = 'C:\\Windows\\SysWOW64\\MicrosoftWebDriver.exe';

let defaultInstance : ChildProcess;

export const path = edgeDriverPath;

export function start(args? : string[]) {
    defaultInstance = spawn(edgeDriverPath, args, { stdio: 'inherit' });
    return defaultInstance;
}

export function stop() {
    if (defaultInstance != null) {
        defaultInstance.kill();
    }
}
