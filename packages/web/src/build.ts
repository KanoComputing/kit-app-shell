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
        skipMinifyHtml,
        skipBabel,
        skipTerser,
        resources = [],
        polyfills = [],
        moduleContext = {},
        replaces = [],
        targets = {},
        babelExclude = [],
        additionalResources = [],
    } = opts;

    let buildtime = {
        polyfills: [] as any,
        favicons: [] as any,
    };

    return rimraf(out)
        .then(() => copyResources(additionalResources, out, app))
        .then(() => copyPolyfills(scripts, out).then((polyfills) => {
            buildtime.polyfills = polyfills;
        }))
        .then(() => generateFavicons(config, out, app).then((favicons) => {
            buildtime.favicons = favicons;
        }))
        .then(() => Bundler.bundle(
            `${__dirname}/../www/index.html`,
            `${__dirname}/../www/shell.js`,
            path.join(app, 'index.js'),
            config,
            {
                js: {
                    bundleOnly,
                    skipMinifyHtml,
                    skipBabel,
                    skipTerser,
                    targets,
                },
                appJs: {
                    bundleOnly,
                    skipMinifyHtml,
                    skipBabel,
                    skipTerser,
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
                        ${buildtime.favicons.length > 0 ? faviconTemplate : ''}
                        <style>
                            html, body {
                                background-color: ${config.BACKGROUND_COLOR || DEFAULT_BACKGROUND_COLOR};
                            }
                        </style>${generateElements(buildtime.polyfills)}`,
                    },
                },
            },
        ))
        .then((bundle) => Bundler.write(bundle, out));
};

export default webBuild;
