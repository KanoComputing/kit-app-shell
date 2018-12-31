const Bundler = require('@kano/kit-app-shell-core/lib/bundler');
const path = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

function build(opts) {
    const {
        app,
        config = {},
        out,
        bundleOnly,
        resources = [],
        polyfills = [],
        moduleContext = {},
        replaces = [],
        targets = {},
        babelExclude = [],
    } = opts;
    return rimraf(out)
        .then(() => Bundler.bundle(
            `${__dirname}/../www/index.html`,
            `${__dirname}/../www/shell.js`,
            path.join(app, 'index.js'),
            config,
            {
                js: {
                    bundleOnly,
                    targets,
                },
                appJs: {
                    bundleOnly,
                    resources,
                    polyfills,
                    moduleContext,
                    replaces,
                    targets,
                    babelExclude,
                },
            },
        ))
        .then(bundle => Bundler.write(bundle, out));
}


module.exports = build;
