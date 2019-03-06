const { resolve, join } = require('path');
const { execSync } = require('child_process');
const { platform } = require('os');
const { readFileSync, writeFileSync } = require('fs');

const APP_PATH = resolve('./app');
const BUILD_PARAMS = '--arch=x64 --target_arch=x64 --target=3.1.0 --runtime=electron --dist-url=https://atom.io/download/electron';
const packagesToRebuild = ['noble-uwp'];

if (platform() === 'darwin') {
    /* Add an extra resollution for xpc-connection to resolve an issue with noble on macOS Mojave */
    const packageJsonPath = join(APP_PATH, 'package.json');
    const packageJson = readFileSync(packageJsonPath, { encoding: 'utf8' });
    const pkg = JSON.parse(packageJson);
    pkg.resolutions['xpc-connection'] = 'sandeepmistry/node-xpc-connection#26/head';
    writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, '  ')}\n`);

    packagesToRebuild.push('xpc-connection');
}

execSync('yarn', { cwd: APP_PATH, stdio: 'inherit' });
execSync(`npm rebuild ${packagesToRebuild.join(' ')} ${BUILD_PARAMS}`, { cwd: APP_PATH, stdio: 'inherit' });
