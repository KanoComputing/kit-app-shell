import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import * as mkdirpCb from 'mkdirp';
import * as globCb from 'glob';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { copy } from '@kano/kit-app-shell-core/lib/util/fs';
import { Bundler, BundleAppOptions } from '@kano/kit-app-shell-core/lib/bundler';

const writeFile = promisify(fs.writeFile);
const glob = promisify(globCb);
const mkdirp = promisify(mkdirpCb);

// Do not embbed any of this in the app, these are not required to run
// Ignoring these files will help reducing the overall app size
const cleanIgnore = [
    '**/.npmrc',
    '**/*.md',
    '**/*.d.ts',
    '**/*.d.js',
    '**/.gitignore',
    '**/.gitmodules',
    '**/.eslintrc',
    '**/.eslintrc.js',
    '**/.eslintrc.json',
    '**/karma.conf.js',
    '**/.npmignore',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/rollup.config.js',
    '**/*.test.js',
    '**/.travis.yaml',
    '**/.travis.yml',
    '**/LICENSE.md',
    '**/TODO.md',
    '**/LICENSE.txt',
    '**/CHANGES.md',
    '**/CHANGELOG.md',
    '**/CONTRIBUTING.md',
    '**/binding.gyp',
    '**/*.sln',
    '**/*.vcxproj',
    '**/*.vcxproj.filters',
    '**/config.gypi',
    '**/bower.json',
    '**/Gruntfile.js',
    '**/*.iobj',
    '**/*.lastbuildstate',
    '**/*.h',
    '**/*.cpp',
    '**/*.c',
    '**/*.tlog',
];

const babelTargets = {
    chrome: 66, // Electron 3 = Chromium 66
};

/**
 * Copies the electron app from the `app` directory as a template
 * @param {String} out Path to the copy destination
 */
function copyElectronApp(out) {
    const cwd = path.join(__dirname, '../app');
    return glob('**/*.*', {
        cwd,
        ignore: [
            ...cleanIgnore,
            'index.html',
            'index.js',
        ],
        dot: true,
        nodir: true,
    }).then((paths) => {
        // Chain file copying
        const tasks = paths.reduce((p, file) => {
            const src = path.join(cwd, file);
            const dest = path.join(out, file);
            return p.then(() => copy(src, dest));
        }, Promise.resolve());
        return tasks;
    });
}

/**
 * Create a config.json file in the defined target from a given config object
 * This is used to embbed a config with a built app, ensuring it frozen
 * @param {Object} config The config to save in the app
 * @param {String} out Target directory
 */
function createConfig(config, out) {
    return mkdirp(out)
        .then(() => writeFile(
            path.join(out, 'config.json'),
            JSON.stringify(Object.assign({ BUNDLED: true }, config)),
        ));
}

type ElectronBuildOptions = BundleAppOptions & {
    app : string;
    config : any;
    out : string;
};

export default function build(opts : ElectronBuildOptions) {
    const {
        app,
        config = {},
        out,
        bundleOnly,
    } = opts;
    processState.setStep(`Creating electron app '${config.APP_NAME}'`);
    const tasks = [
        copyElectronApp(out),
        createConfig(config, out),
        Bundler.bundle(
            path.join(__dirname, '../app/index.html'),
            path.join(__dirname, '../app/index.js'),
            path.join(app, 'index.js'),
            config,
            {
                js: {
                    bundleOnly,
                    targets: babelTargets,
                },
                appJs: {
                    ...opts,
                    targets: babelTargets,
                },
                html: {},
            },
        )
            .then(bundle => Bundler.write(bundle, out)),
    ];
    return Promise.all(tasks)
        .then((results) => {
            processState.setStep(`Created electron app '${config.APP_NAME}'`);
            // Return bundle outputDir
            return results[2];
        });
}
