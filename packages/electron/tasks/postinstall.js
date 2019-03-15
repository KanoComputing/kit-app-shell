const { resolve, join } = require('path');
const { execSync } = require('child_process');
const { platform } = require('os');
const { readFileSync, writeFileSync } = require('fs');

const APP_PATH = resolve('./app');
const BUILD_PARAMS = '--arch=x64 --target_arch=x64 --target=3.1.0 --runtime=electron --dist-url=https://atom.io/download/electron';
const packagesToRebuild = [];

function runYarn() {
    execSync('yarn', { cwd: APP_PATH, stdio: 'inherit' });
}

if (platform() === 'darwin') {
    /* Add an extra resollution for xpc-connection to resolve an issue with noble on macOS Mojave */
    const packageJsonPath = join(APP_PATH, 'package.json');
    const packageJson = readFileSync(packageJsonPath, { encoding: 'utf8' });
    const pkg = JSON.parse(packageJson);
    pkg.resolutions['xpc-connection'] = 'sandeepmistry/node-xpc-connection#26/head';
    writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, '  ')}\n`);

    runYarn();

    /**
     * Rebuild xpc-connection to match the version of electron. We use electron-rebuild
     * becase of a glitch in npm rebuild that causes the modules to be built against iojs-3.1.0
     * instead of electron-3.1.0.
     */
    packagesToRebuild.push('xpc-connection');
    execSync(`yarn electron-rebuild -o ${packagesToRebuild.join(',')}`, { cwd: APP_PATH, stdio: 'inherit' });
} else if (platform() === 'win32') {
    runYarn();

    /**
     * On Windows, noble-uwp needs rebuilding to match electron version.
     * We use npm rebuild because electron-rebuild doesn't work properly on Windows
     */
    packagesToRebuild.push('noble-uwp');
    execSync(`npm rebuild ${packagesToRebuild.join(' ')} ${BUILD_PARAMS}`, { cwd: APP_PATH, stdio: 'inherit' });
}
