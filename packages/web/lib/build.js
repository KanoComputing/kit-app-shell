const { Bundler } = require('@kano/kit-app-shell-common');
const path = require('path');

function build({ app, config = {}, out }, { resources = [], polyfills = [], moduleContext = {}, replaces = {} } = {}) {
    return Bundler.bundle(
        __dirname + '/../www/index.html',
        __dirname + '/../www/shell.js',
        path.join(app, 'index.js'),
        config,
        {
            appJs: {
                resources,
                polyfills,
                moduleContext,
                replaces,
            },
        })
        .then(bundle => Bundler.write(bundle, out));
}


module.exports = build;