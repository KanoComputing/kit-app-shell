const { build } = require('@kano/kit-app-shell-electron');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const os = require('os');
const mkdirp = require('mkdirp');
const packager = require('electron-packager');

function windowsBuild({ app, config = {}, out }, commandOpts) {
    const BUILD_DIR = path.join(os.tmpdir(), 'kash-windows-build');
    mkdirp.sync(BUILD_DIR);
    return build({ app, config, out: BUILD_DIR }, commandOpts)
        .then(() => {
            const packagerOptions = {
                dir: BUILD_DIR,
                packageManager: 'yarn',
                overwrite: true,
                out,
                prune: true,
                // TODO: use asar package. This does not work at the moment as it causes an issue with the PIXI loader
                // XHR maybe?
                asar: false,
                name: config.APP_NAME,
                platform: 'win32',
                arch: 'x64',
                win32metadata: {
                    CompanyName: config.MANUFACTURER,
                    FileDescription: config.APP_NAME,
                    ProductName: config.APP_NAME,
                },
                icon: path.join(app, config.ICONS.WINDOWS),
            };
            return packager(packagerOptions);
        });
}

module.exports = windowsBuild;
