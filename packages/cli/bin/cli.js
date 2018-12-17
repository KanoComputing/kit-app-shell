#!/usr/bin/env node
const path = require('path');
const parser = require('yargs-parser');
const { processState, test } = require('@kano/kit-app-shell-core');
const { loadPlatformKey, registerCommands, registerOptions } = require('../lib/platform');
const colors = require('colors/safe');

// TODO: Move every non pure CLI code to core. Allowing a programatic usage

function parseCommon(y) {
    return y
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

// TODO: This fails as we can load multiple CLI UI
function end() {
    // spinner.stop();
}

const firstPass = parser(process.argv.slice(2));

const [command, platformId] = firstPass._;

if (!platformId) {
    // TODO: here generate the yargs default API and print usage with missing platform error
    return;
}

const platformCli = loadPlatformKey(platformId, 'cli');

const platform = {
    cli: platformCli,
};

const yargs = require('yargs');

yargs // eslint-disable-line
    .scriptName('kash')
    .command(`run ${platformId} [app]`, 'run the application', (yargs) => {
        parseCommon(yargs);
        registerOptions(yargs, platform, command);
    }, (argv) => {
        const { runCommand } = require('../lib/command');
        runCommand(command, platformId, argv).then(() => end());
    })
    .command(`build ${platformId} [app]`, 'build the application', (yargs) => {
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
        registerOptions(yargs, platform, command);
    }, (argv) => {
        const { runCommand } = require('../lib/command');
        runCommand(command, platformId, argv).then(() => end());
    })
    .command(`test ${platformId} [app]`, 'test the application', (yargs) => {
        parseCommon(yargs);
        registerOptions(yargs, platform, command);
    }, (argv) => {
        const runTest = require('../lib/test');
        return runTest(argv, platformId, command)
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
    })
    .fail((message, error, yargs) => {
        console.log(yargs.help());
        console.log('\n', colors.red(message));
        process.exit(1);
    });

registerCommands(yargs, platform);

// argv is a getter. This will trigger the CLI managment
const { argv } = yargs;

// Mount the CLI UI managers if not quiet
if (!argv.quiet) {
    // Avoid wasting people's time by loading only the necessary code
    if (process.stdout.isTTY) {
        const spinner = require('../lib/spinner');
        // Use spinner UI for humans
        spinner.setup(processState);
    } else {
        // Use normal logging for machines (e.g. CI)
        const output = require('../lib/output');
        output.setup(processState);
    }
}
