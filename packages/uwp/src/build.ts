import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { Bundler } from '@kano/kit-app-shell-core/lib/bundler';
import * as path from 'path';
import * as fs from 'fs';
import { IBuild } from '@kano/kit-app-shell-core/lib/types';
import { buildUWPApp } from './msbuild';
import * as rimrafCb from 'rimraf';
import { promisify } from 'util';
import { generateProject } from './project';
import { IUWPBuildOptions } from './types';
import { copyPolyfills, generateElements } from '@kano/kit-app-shell-core/lib/util/polyfills';
import { scripts } from './polyfills';
import { getCertificatePath } from './options';
import * as globCb from 'glob';
import * as mkdirpCb from 'mkdirp';

const mkdirp = promisify(mkdirpCb);
const glob = promisify(globCb);
const rename = promisify(fs.rename);

const rimraf = promisify(rimrafCb);

const appxBuild : IBuild = (opts : IUWPBuildOptions) => {
    let wwwPath;

    let uwpDir;
    let projectDir;

    const solutionTemplateDir = path.join(__dirname, '../template');

    const certPath = getCertificatePath(opts);

    const baseUrl = `ms-appx-web://${opts.config.UWP.PACKAGE_NAME}/www/`;

    return generateProject(solutionTemplateDir, opts, certPath)
        .then((paths) => {
            uwpDir = paths.solution;
            projectDir = paths.project;
            wwwPath = path.join(paths.project, 'www');
            return copyPolyfills(scripts, wwwPath);
        })
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
                            injectScript: generateElements(injectNames),
                            base: `<base href="${baseUrl}"><style>html,body{ background: ${opts.config.BACKGROUND_COLOR} }</style>`,
                        },
                    },
                },
            )
                .then((bundle) => Bundler.write(bundle, wwwPath))
                .then(() => rimraf(path.join(uwpDir, 'AppPackages')))
                .then(() => mkdirp(opts.out))
                .then(() => {
                    if (opts.projectOnly) {
                        return rename(uwpDir, path.join(opts.out, opts.config.UWP.PACKAGE_NAME)).then(() => opts.out);
                    }
                    processState.setInfo('Building UWP app');
                    return buildUWPApp(uwpDir, { release: opts.release, msbuildPath: opts.msbuildPath })
                        .then(() => {
                            const dest = path.join(projectDir, 'AppPackages');
                            return findBuiltApp('**/*.appxbundle', dest, opts.out)
                                .then((target) => {
                                    processState.setSuccess(`Built UWP app at ${target}`);
                                    return target;
                                });
                        });
                });
        });
};

export function findBuiltApp(pattern : string, src : string, dest : string) {
    return glob(pattern, { cwd: src })
        .then((results) => {
            const [result] = results;
            if (!result) {
                throw new Error('Could not find generated file');
            }
            // Move the generated apk to the out directory
            const target : string = path.join(dest, path.basename(result));
            // Ensure the directory exists
            return mkdirp(dest)
                .then(() => rename(path.join(src, result), target))
                .then(() => target);
        });
}

export default appxBuild;
