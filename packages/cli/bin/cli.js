#!/usr/bin/env node
const path = require('path');
const parser = require('yargs-parser');
const { ConfigLoader, log, processState, test, RcLoader } = require('@kano/kit-app-shell-core');
const { loadPlatform } = require('../lib/platform');
const spinner = require('../lib/spinner');
const output = require('../lib/output');

// TODO: Move every non pure CLI code to core. Allowing a programatic usage

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
        .coerce('app', path.resolve);
}

/**
 * Loads the config file from the app's directory
 * @param {String} app path to the app directory
 */
function loadRc(app) {
    return RcLoader.load(app);
}

function deleteCommandKeys(obj) {
    [
        'build',
        'run',
        'test',
    ].forEach((key) => {
        delete obj[key];
    });
}

function agregateArgv(platform, argv, command) {
    const platformOpts = parser(process.argv.slice(2), platform.cli(command));
    // Remove the flat args
    delete platformOpts._;
    const config = ConfigLoader.load(argv.app, argv.env);
    config.BUILD_NUMBER = parseInt(process.env.BUILD_NUMBER, 10) || argv.buildNumber;
    // Load config files
    return loadRc(argv.app)
        .then((rcOpts) => {
            // Options specific to the platform defined in the config file
            const rcPlatformOpts = rcOpts[argv.platform] || {};
            // Remove the platform key from the rc options
            delete rcOpts[argv.platform];
            // Collect the command options form the rc platform data
            const rcPlatformCommandOpts = rcPlatformOpts[command] || {};
            // Remove command keys from the platform object in the rc data
            deleteCommandKeys(rcPlatformOpts);
            const rcCommandOpts = rcOpts[command] || {};
            // Remove the command keys from the rc data itself
            deleteCommandKeys(rcOpts);
            // Merge the command options
            const commandOpts = Object.assign({}, rcOpts, rcPlatformOpts, platformOpts, rcCommandOpts, rcPlatformCommandOpts);
            argv.config = config;
            return {
                opts: argv,
                commandOpts,
            };
        });
}

function end() {
    spinner.stop();
}

function runCommand(command, argv) {
    const platform = loadPlatform(argv.platform);
    return agregateArgv(platform, argv, command)
        .then(({ opts, commandOpts }) => {
            log.trace('OPTIONS', opts);
            log.trace('COMMAND OPTIONS', commandOpts);
            // About to start the big boy tasks. Let the process breathe and setup its CLI interface
            process.nextTick(() => {
                const result = platform[command](opts, commandOpts);
                if (result && 'then' in result && 'catch' in result) {
                    result.catch(e => processState.setFailure(e))
                        .then(() => end());
                } else {
                    end();
                }
            });
        });
}

const argv = require('yargs') // eslint-disable-line
    .command('run <platform> [app]', 'run the application', (yargs) => {
        parseCommon(yargs);
    }, (argv) => {
        runCommand('run', argv);
    })
    .command('build <platform> [app]', 'build the application', (yargs) => {
        parseCommon(yargs)
            .array('resources')
            .option('out', {
                alias: 'o',
                required: true,
            })
            .option('buildNumber', {
                alias: 'n',
                default: 0,
            })
            .number('buildNumber')
            .boolean('bundleOnly')
            .coerce('out', (v) => {
                return path.resolve(v);
            });
    }, (argv) => {
        runCommand('build', argv);
    })
    .command('test <platform> [app]', 'test the application', (yargs) => {
        parseCommon(yargs);
    }, (argv) => {
        const platform = loadPlatform(argv.platform);
        return agregateArgv(platform, argv, 'test')
            .then(({ opts, commandOpts }) => test(platform, opts, commandOpts))
            .catch(e => processState.setFailure(e))
            .then(() => end());
    })
    .option('quiet', {
        alias: 'q',
        default: false,
    })
    .option('verbose', {
        alias: 'v',
        default: false
    }).argv;

if (!argv.quiet) {
    if (process.stdout.isTTY) {
        spinner.setup(processState);
    } else {
        output.setup(processState);
    }
}
