#!/usr/bin/env node
const path = require('path');
const { loadPlatform } = require('../lib/platform');

function parseCommon(y) {
    return y
        .positional('platform', {
            describe: 'target platform',
        })
        .positional('app', {
            describe: 'root of the app',
            default: './',
        });
}

function formatOpts(argv) {
    const opts = {
        app: path.resolve(argv.app),
    };

    return Object.assign({}, argv, opts);
}

let y;

require('yargs') // eslint-disable-line
    .command('run <platform> [app]', 'run the application', (yargs) => {
        parseCommon(yargs);
        y = yargs;
    }, (argv) => {
        const platform = loadPlatform(argv.platform);
        const opts = formatOpts(argv);
        platform.config(require('yargs'));
        platform.run({
            app: opts.app,
        });
    })
    .command('build <platform> [app]', 'build the application', (yargs) => {
        parseCommon(yargs)
            .option('out', {
                alias: 'o',
                required: true,
            });
    }, (argv) => {
        console.log(argv);
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .argv;