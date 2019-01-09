import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import * as path from 'path';
import { promisify } from 'util';
import * as rimrafCb from 'rimraf';
const rimraf = promisify(rimrafCb);

type WebBuildOptions = any;

export default function build(opts : WebBuildOptions) {
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
                html: {},
            },
        ))
        .then(bundle => Bundler.write(bundle, out));
}
