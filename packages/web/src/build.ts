import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import * as path from 'path';
import { promisify } from 'util';
import * as rimrafCb from 'rimraf';
import { IBuild, IBuildOptions, IKashConfig } from '@kano/kit-app-shell-core/lib/types';
import { copyPolyfills, generateElements } from '@kano/kit-app-shell-core/lib/util/polyfills';
import { scripts } from './polyfills';
import { generateFavicons, faviconTemplate } from './favicon';
import { copyResources, IResources } from './copy-resources';

const rimraf = promisify(rimrafCb);

interface IWebBuildOptions extends IBuildOptions {
    additionalResources? : IResources;
}

const DEFAULT_PAGE_TITLE = 'Kit App web demo';
const DEFAULT_BACKGROUND_COLOR = '#ffffff';

const webBuild : IBuild = function build(opts : IWebBuildOptions) {
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
        additionalResources = [],
    } = opts;
    return rimraf(out)
        .then(() => copyResources(additionalResources, out, app))
        .then(() => copyPolyfills(scripts, out))
        .then(() => generateFavicons(config.ICONS.FAVICON, out))
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
                        head: `
                        <title>${config.APP_NAME || DEFAULT_PAGE_TITLE}</title>
                        ${faviconTemplate}
                        <style>
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
