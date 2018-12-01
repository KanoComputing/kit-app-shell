const { Bundler } = require('@kano/kit-app-shell-common');
const path = require('path');

function build(appDir, config, outDir, appOpts = {}) {
    return Bundler.bundle(
        __dirname + '/../www/index.html',
        __dirname + '/../www/shell.js',
        path.join(appDir, 'index.js'),
        config,
        {
            appJs: appOpts
        })
        .then((bundle) => {
            Bundler.write(bundle, outDir);
        });
}


module.exports = build;