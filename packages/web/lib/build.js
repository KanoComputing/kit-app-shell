const { Bundler } = require('@kano/kit-app-shell-core');
const path = require('path');

function build({ app, config = {}, out }, { resources = [], polyfills = [], moduleContext = {}, replaces = {}, targets = {} } = {}) {
    return Bundler.bundle(
        __dirname + '/../www/index.html',
        __dirname + '/../www/shell.js',
        path.join(app, 'index.js'),
        config,
        {
            js: {
                targets,
            }
            appJs: {
                resources,
                polyfills,
                moduleContext,
                replaces,
                targets,
            },
        })
        .then(bundle => Bundler.write(bundle, out));
}


module.exports = build;