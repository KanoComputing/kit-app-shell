"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const util_1 = require("util");
const mkdirpCb = require("mkdirp");
const globCb = require("glob");
const process_state_1 = require("@kano/kit-app-shell-core/lib/process-state");
const fs_1 = require("@kano/kit-app-shell-core/lib/util/fs");
const bundler_1 = require("@kano/kit-app-shell-core/lib/bundler");
const writeFile = util_1.promisify(fs.writeFile);
const glob = util_1.promisify(globCb);
const mkdirp = util_1.promisify(mkdirpCb);
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
    chrome: 66,
};
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
        const tasks = paths.reduce((p, file) => {
            const src = path.join(cwd, file);
            const dest = path.join(out, file);
            return p.then(() => fs_1.copy(src, dest));
        }, Promise.resolve());
        return tasks;
    });
}
function createConfig(config, out) {
    return mkdirp(out)
        .then(() => writeFile(path.join(out, 'config.json'), JSON.stringify(Object.assign({ BUNDLED: true }, config))));
}
function build(opts) {
    const { app, config = {}, out, bundleOnly, } = opts;
    process_state_1.processState.setStep(`Creating electron app '${config.APP_NAME}'`);
    const tasks = [
        copyElectronApp(out),
        createConfig(config, out),
        bundler_1.Bundler.bundle(path.join(__dirname, '../app/index.html'), path.join(__dirname, '../app/index.js'), path.join(app, 'index.js'), config, {
            js: {
                bundleOnly,
                targets: babelTargets,
            },
            appJs: Object.assign({}, opts, { targets: babelTargets }),
            html: {},
        })
            .then(bundle => bundler_1.Bundler.write(bundle, out)),
    ];
    return Promise.all(tasks)
        .then((results) => {
        process_state_1.processState.setStep(`Created electron app '${config.APP_NAME}'`);
        return results[2];
    });
}
exports.default = build;
//# sourceMappingURL=build.js.map