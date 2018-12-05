const { Bundler, copy, processState } = require('@kano/kit-app-shell-common');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');

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

function copyElectronApp(out) {
    const cwd = path.join(__dirname, '../app');
    const paths = glob.sync('**/*.*', {
        cwd,
        ignore: [
            ...cleanIgnore,
            'index.html',
            'index.js',
        ],
        dot: true,
        nodir: true,
    });
    const tasks = paths.reduce((p, file) => {
        const src = path.join(cwd, file);
        const dest = path.join(out, file);
        return p.then(() => copy(src, dest));
    }, Promise.resolve());
    return tasks;
}

function createConfig(config, out) {
    mkdirp.sync(out);
    return new Promise((resolve, reject) => {
        fs.writeFile(path.join(out, 'config.json'), JSON.stringify(Object.assign({ BUNDLED: true }, config)), (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function build({ app, config = {}, out }, { resources = [], polyfills = [], moduleContext = {}, replaces = {} } = {}) {
    processState.setStep(`Creating electron app '${config.APP_NAME}'`);
    const tasks = [
        copyElectronApp(out),
        createConfig(config, out),
        Bundler.bundle(
            __dirname + '/../app/index.html',
            __dirname + '/../app/index.js',
            path.join(app, 'index.js'),
            config,
            {
                appJs: {
                    resources,
                    polyfills,
                    moduleContext,
                    replaces,
                },
            })
            .then(bundle => Bundler.write(bundle, out))
    ];
    return Promise.all(tasks)
        .then(() => processState.setStep(`Created electron app '${config.APP_NAME}'`));
}

module.exports = build;