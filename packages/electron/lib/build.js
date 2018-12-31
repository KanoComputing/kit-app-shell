const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const mkdirp = promisify(require('mkdirp'));
const processState = require('@kano/kit-app-shell-core/lib/process-state');
const util = require('@kano/kit-app-shell-core/lib/util');
const Bundler = require('@kano/kit-app-shell-core/lib/bundler');

const writeFile = promisify(fs.writeFile);

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
            return p.then(() => util.fs.copy(src, dest));
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

function build(opts = {}) {
    const {
        app,
        config = {},
        out,
        bundleOnly,
        resources = [],
        polyfills = [],
        moduleContext = {},
        replaces = [],
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
                    bundleOnly,
                    resources,
                    polyfills,
                    moduleContext,
                    replaces,
                    targets: babelTargets,
                },
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

module.exports = build;
