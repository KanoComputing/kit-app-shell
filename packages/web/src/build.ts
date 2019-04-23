import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import * as path from 'path';
import { promisify } from 'util';
import * as rimrafCb from 'rimraf';
import { IBuild, IBuildOptions, IKashConfig } from '@kano/kit-app-shell-core/lib/types';
import { copyPolyfills, generateElements } from '@kano/kit-app-shell-core/lib/util/polyfills';
import { scripts } from './polyfills';

const rimraf = promisify(rimrafCb);

type WebBuildOptions = IBuildOptions;

const DEFAULT_BACKGROUND_COLOR = '#ffffff';

const webBuild : IBuild = function build(opts : WebBuildOptions) {
    const {
        app,
        config = {} as IKashConfig,
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
        .then(() => copyPolyfills(scripts, out))
        .then((names) => Bundler.bundle(
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
                html: {
                    replacements: {
                        head: `<style>
                            html, body {
                                background-color: ${config.BACKGROUND_COLOR || DEFAULT_BACKGROUND_COLOR};
                            }
                        </style>${generateElements(names)}`,
                    },
                },
            },
        ))
        .then((bundle) => Bundler.write(bundle, out));
};

export default webBuild;
