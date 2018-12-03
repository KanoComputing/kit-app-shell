#!/usr/bin/env node
const path = require('path');
const parser = require('yargs-parser');
const { ConfigLoader } = require('@kano/kit-app-shell-common');
const { loadPlatform } = require('../lib/platform');

function parseCommon(y) {
    return y
        .positional('platform', {
            describe: 'Target platform',
        })
        .positional('app', {
            describe: 'Root of the app',
            default: './',
        })
        .option('env', {
            description: 'Target environment',
            alias: 'e',
            devault: 'development',
        })
}

function formatOpts(argv, platform) {
    const opts = {
        app: path.resolve(argv.app),
        env: argv.env,
    };

    return Object.assign({}, platform, argv, opts);
}

function agregateArgv(platform, argv) {
    const platformOpts = parser(process.argv.slice(2), platform.cli('run'));
    const opts = formatOpts(argv, platformOpts);
    const config = ConfigLoader.load(opts.app, opts.env);
    opts.config = config;
    return opts;
}

const y = require('yargs') // eslint-disable-line
    .command('run <platform> [app]', 'run the application', (yargs) => {
        parseCommon(yargs);
    }, (argv) => {
        const platform = loadPlatform(argv.platform);
        const opts = agregateArgv(platform, argv);
        platform.run(opts);
    })
    .command('build <platform> [app]', 'build the application', (yargs) => {
        parseCommon(yargs)
            .option('out', {
                alias: 'o',
                required: true,
            });
    }, (argv) => {
        const platform = loadPlatform(argv.platform);
        const opts = agregateArgv(platform, argv);
        opts.out = path.resolve(opts.out);
        platform.build(opts);
    })
    .option('verbose', {
        alias: 'v',
        default: false
    }).argv;
