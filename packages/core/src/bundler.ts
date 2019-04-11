import * as fs from 'fs';
import * as rollup from 'rollup';
import * as path from 'path';
import nodeResolve = require('rollup-plugin-node-resolve');
import { replace } from './plugins/replace';
import polyfill = require('rollup-plugin-polyfill');
import inject = require('rollup-plugin-inject');
import virtual = require('rollup-plugin-virtual');
import * as mkdirp from 'mkdirp';
import { replaceIndex, addRequirejs } from './html';
import { log } from './log';
import { util } from './util';
import { processState } from './process-state';
import { ProgressTracker } from './progress';
import { promisify } from 'util';
import * as globCb from 'glob';
import escapeRegExp = require('escape-regexp');
import {
    IBundleOptions,
    IBundledFile,
    IBundle,
    IBundleSourceOptions,
    ICopyTask,
    IKashConfig,
    IBundleHtmlOptions,
} from './types';

const glob = promisify(globCb);

const writeFile = promisify(fs.writeFile);

function write(file : IBundledFile, outputDir : string) : Promise<void> {
    const filePath = path.join(outputDir, file.fileName);
    return writeFile(filePath, file.code);
}

function writeStatic(root : string, file : string, outputDir : string) : Promise<void> {
    const filePath = path.join(root, file);
    const outFile = path.join(outputDir, file);
    return util.fs.copy(filePath, outFile);
}

export class Bundler {
    static write(bundle : IBundle, outputDir : string) : Promise<string> {
        const tasks = [];
        const appOutputDir = path.join(outputDir, 'www');
        // TODO: use promise style promisify
        mkdirp.sync(outputDir);
        mkdirp.sync(appOutputDir);
        tasks.push(write(bundle.html, outputDir));
        bundle.js.forEach((file) => tasks.push(write(file, outputDir)));
        bundle.appJs.forEach((file) => tasks.push(write(file, appOutputDir)));
        if (bundle.appStatic) {
            const { root, files } = bundle.appStatic;
            // Write assets in series
            const p = files.reduce(
                (acc, file) => acc.then(() => writeStatic(root, file, appOutputDir)),
                Promise.resolve(),
            );
            tasks.push(p);
        }
        return Promise.all(tasks)
            .then(() => {
                processState.setSuccess('Bundled app');
                return outputDir;
            });
    }
    static bundle(
        html : string,
        js : string,
        appSrc : string,
        config : IKashConfig,
        opts : IBundleOptions = { html: { }, js: {}, appJs: { resources: [] } },
    ) : Promise<IBundle> {
        processState.setStep(`Bundling app at ${appSrc}`);
        const appSrcName = path.basename(appSrc);
        const htmlOutput = Bundler.bundleHtml(html, opts.html || {} as IBundleHtmlOptions);
        const stage1 = replaceIndex(html, js, htmlOutput);
        const htmlBundle : IBundledFile = {
            fileName: path.basename(html),
            code: stage1,
        };
        const tasks : Array<Promise<any>> = [
            Bundler.bundleSources(js, config, Object.assign({}, opts.js || {}, { appSrcName })),
            Bundler.bundleSources(appSrc, config, opts.appJs),
        ];
        if (opts.appJs && opts.appJs.resources) {
            tasks.push(Bundler.bundleStatic(opts.appJs.resources, path.dirname(appSrc)));
        }
        return Promise.all(tasks).then((results) => {
            const pkg : IBundle = {
                html: htmlBundle,
                js: results[0],
                appJs: results[1],
                appStatic: results[2],
            };
            pkg.js.unshift({
                fileName: 'require.js',
                code: fs.readFileSync(require.resolve('requirejs/require.js'), 'utf-8'),
            });
            return pkg;
        });
    }
    static bundleHtml(input : string, opts : IBundleHtmlOptions) : string {
        const contents = fs.readFileSync(input, 'utf-8');
        const stage1 = addRequirejs(contents);
        const reg = /<!--\s?build:(.*?)\s?-->([\s\S]*)<!--\s?endbuild\s?-->/g;
        const replacements = opts.replacements || {};
        // Replace html comment with build tag
        return stage1.replace(reg, (m, g0) => replacements[g0] || '');
    }
    static bundleSources(input : string, config : IKashConfig, opts : IBundleSourceOptions) : Promise<IBundledFile[]> {
        const {
            polyfills = [],
            moduleContext = {},
            replaces = [],
            targets = {},
            babelExclude = [],
            bundleOnly = false,
            appSrcName = 'index.js',
        } = opts;
        const tracker = new ProgressTracker();
        tracker.on('progress', (e) => {
            processState.setStep(`(${e.loaded}) Bundling '${e.file}'`);
        });
        // Generate future config path
        // TODO: This does not work on non root files, figure out a solution
        const inputRoot = path.dirname(input);
        const configPath = path.join(inputRoot, 'config.js');
        const replacers = replaces.map((replaceOpts) => replace(Object.assign(
            { delimiters: ['', ''] },
            replaceOpts,
        )));
        const defaultOptions = {
            input: [input],
            experimentalCodeSplitting: true,
            plugins: [
                tracker.plugin(),
                replace({
                    delimiters: ['', ''],
                    exclude: [path.join(inputRoot, 'node_modules/**')],
                    values: {
                        // ...replaces,
                        'window.KitAppShellConfig.APP_SRC': `'./www/${appSrcName}'`,
                    },
                }),
                ...replacers,
                virtual({
                    // Config is external, let rollup import it
                    [configPath]: `export default Object.assign(${JSON.stringify(config)}, window.KitAppShellConfig || {});`,
                }),
                inject({
                    modules: {
                        // Replace every instance of the provided config with the added module
                        'window.KitAppShellConfig': configPath,
                    },
                }),
                polyfill(escapeRegExp(path.resolve(input)), polyfills),
                nodeResolve(),
            ],
            moduleContext,
            // Silence for now
            onwarn: () => null,
        };
        if (!bundleOnly) {
            // Skip babel loading if it's not going to be used
            const babel = require('rollup-plugin-babel');
            const minifyHTML = require('rollup-plugin-minify-html-literals').default;
            const { terser } = require('rollup-plugin-terser');
            // Manual resolving eable an easy mock-require,
            // otherwise babel tries to do it on its own
            const babelPluginSyntaxDynamicImport = require.resolve('@babel/plugin-syntax-dynamic-import');
            const babelPresetEnv = require.resolve('@babel/preset-env');

            defaultOptions.plugins.push(minifyHTML());
            defaultOptions.plugins.push(babel({
                exclude: babelExclude,
                plugins: [
                    babelPluginSyntaxDynamicImport,
                ],
                presets: [
                    [
                        babelPresetEnv,
                        {
                            targets,
                        },
                    ],
                ],
                compact: true,
            }));
            defaultOptions.plugins.push(terser());
        }
        log.trace('ROLLUP OPTIONS', defaultOptions);
        return rollup.rollup(defaultOptions)
            .then((bundle) => bundle.generate({ format: 'amd' }))
            .then(({ output }) => Object.keys(output).map((id) => {
                // Rollup reports incorrect typings ¯\_(ツ)_/¯
                return ({
                    // @ts-ignore
                    fileName: output[id].fileName,
                    // @ts-ignore
                    code: output[id].code,
                });
            }));
    }
    static bundleStatic(patterns : string[] = [], appRoot : string = '/') : Promise<ICopyTask> {
        const tasks = patterns.map((pattern) => glob(pattern, { cwd: appRoot, nodir: true }));
        return Promise.all(tasks)
            .then((results) => {
                const fileList = results
                    .reduce<string[]>((acc, files) => acc.concat(files), []);
                return {
                    root: appRoot,
                    files: fileList,
                };
            });
    }
}
