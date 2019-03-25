import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { util } from '@kano/kit-app-shell-core/lib/util';
import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import * as path from 'path';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';

const appxBuild : IBuild = (opts) => {
    const wwwPath = path.join(__dirname, '../Kash/Kash/www');

    const scripts = [
        '@webcomponents/webcomponentsjs/webcomponents-bundle.js',
        '@webcomponents/shadycss/scoping-shim.min.js',
        'text-encoding/lib/encoding.js',
        'text-encoding/lib/encoding-indexes.js',
    ];

    const tasks = scripts.map((script) => {
        const fullPath = require.resolve(script);
        const filename = path.basename(fullPath);
        return util.fs.copy(fullPath, path.join(wwwPath, filename)).then(() => filename);
    });
    const baseUrl = 'ms-appx-web://kash/www/';

    return Promise.all(tasks)
        .then((injectNames) => {
            // Bundle the cordova shell and provided app into the www directory
            return Bundler.bundle(
                require.resolve('../www/index.html'),
                require.resolve('../www/index.js'),
                path.join(opts.app, 'index.js'),
                opts.config,
                {
                    appJs: {
                        ...opts,
                    },
                    js: {
                        bundleOnly: opts.bundleOnly,
                        targets: opts.targets,
                        replaces: [{
                            // Avoid jsZip to detect the define from requirejs
                            // TODO: Scope this to the jszip file
                            values: {
                                'typeof define': 'undefined',
                            },
                        }],
                    },
                    html: {
                        replacements: {
                            injectScript: injectNames.map((name) => `<script src="${name}"></script>`).join(''),
                            base: `<base href="${baseUrl}">`,
                        },
                    },
                },
            )
                .then((bundle) => Bundler.write(bundle, wwwPath))
                .then(() => {
                    processState.setSuccess('Built');
                    return wwwPath;
                });
        });
};

export default appxBuild;
