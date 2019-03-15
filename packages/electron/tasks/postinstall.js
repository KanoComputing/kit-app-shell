const { resolve, join } = require('path');
const { execSync } = require('child_process');
const { platform } = require('os');
const { readFileSync, writeFileSync } = require('fs');

const APP_PATH = resolve('./app');
const packagesToRebuild = [];

if (platform() === 'darwin') {
    /* Add an extra resollution for xpc-connection to resolve an issue with noble on macOS Mojave */
    const packageJsonPath = join(APP_PATH, 'package.json');
    const packageJson = readFileSync(packageJsonPath, { encoding: 'utf8' });
    const pkg = JSON.parse(packageJson);
    pkg.resolutions['xpc-connection'] = 'sandeepmistry/node-xpc-connection#26/head';
    writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, '  ')}\n`);

    packagesToRebuild.push('xpc-connection');
} else if (platform() === 'win32') {
    packagesToRebuild.push('noble-uwp');
}

execSync('yarn', { cwd: APP_PATH, stdio: 'inherit' });
execSync(`yarn electron-rebuild -o ${packagesToRebuild.join(',')}`, { cwd: APP_PATH, stdio: 'inherit' });
