const { resolve } = require('path');
const { execSync } = require('child_process');
const { platform } = require('os');

const APP_PATH = resolve('./app');
const BUILD_PARAMS = '--arch=x64 --target_arch=x64 --target=3.1.0 --runtime=electron --dist-url=https://atom.io/download/electron';
const packagesToRebuild = ['noble-uwp'];

if (platform() === 'darwin') {
    packagesToRebuild.push('xpc-connection');
}

execSync('yarn', { cwd: APP_PATH, stdio: 'inherit' });
execSync(`npm rebuild ${packagesToRebuild.join(' ')} ${BUILD_PARAMS}`, { cwd: APP_PATH, stdio: 'inherit' });
