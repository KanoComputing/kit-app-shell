#!/usr/bin/env node
const path = require('path');
const Api = require('sywac/Api');
const { processState, test } = require('@kano/kit-app-shell-core');
const { loadPlatformKey, registerCommands, registerOptions } = require('../lib/platform');
const chalk = require('chalk');

// TODO: Move every non pure CLI code to core. Allowing a programatic usage
function parseCommon(sywac) {
    return sywac
        .positional('[app=./]', {
            params: [{
                required: true,
                desc: 'Path to the root of the app',
                coerce: path.resolve,
            }],
        })
        .string('env', {
            desc: 'Target environment',
            defaultValue: 'development',
        });
}

// TODO: This fails as we can load multiple CLI UI
function end() {
    // spinner.stop();
}

function mountUI(argv) {
    if (argv.quiet) {
        return;
    }
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

function applyStyles(sywac) {
    sywac.style({
        group: s => chalk.cyan.bold(s),
        desc: s => chalk.white(s),
        hints: s => chalk.dim(s),
        flagsError: s => chalk.red(s),
    });
}

function firstPass() {
    // Create local sywac
    const sywac = new Api();

    // All commands available
    const commands = ['run', 'build', 'test'];

    sywac.configure({ name: 'kash' });

    // Generate all commands with generic help message
    commands.forEach((cmd) => {
        sywac.command(`${cmd} <platform> --help`, {
            desc: `Show help for the ${cmd} command`,
            run(argv) {
                return secondPass(argv.platform);
            }
        });
    });

    sywac.help();
    sywac.showHelpByDefault();

    sywac.version();

    applyStyles(sywac);

    return sywac.parse(process.argv.slice(2));
}

function secondPass(platformId) {
    const sywac = new Api();
    const platformCli = loadPlatformKey(platformId, 'cli');

    const platform = {
        cli: platformCli,
    };

    sywac.command('build <platform>', {
        desc: 'build the application',
        setup(sywac) {
            parseCommon(sywac);
            sywac.array('resources')
                .string('--out, -o', {
                    desc: 'Output directory',
                    coerce: path.resolve,
                    required: true,
                })
                .number('--build-number, -n', {
                    defaultValue: 0,
                })
                .boolean('--bundle-only');
            registerOptions(sywac, platform, 'build');
        },
        run(argv) {
            mountUI(argv);
            const { runCommand } = require('../lib/command');
            return runCommand('build', platformId, argv);
        }
    });

    sywac.command(`run <platform>`, {
        desc: 'run the application',
        setup(sywac) {
            parseCommon(sywac);
            registerOptions(sywac, platform, 'run');
        },
        run(argv) {
            mountUI(argv);
            const { runCommand } = require('../lib/command');
            return runCommand('run', platformId, argv);
        }
    });

    sywac.command(`test <platform>`, {
        desc: 'test the application',
        setup(sywac) {
            parseCommon(sywac);
            sywac.string('--prebuilt-app', {
                desc: 'Path to the built app to test',
                required: true,
                coerce(value) {
                    return path.resolve(process.cwd(), value);
                },
            });
            registerOptions(sywac, platform, 'test');
        },
        run(argv) {
            mountUI(argv);
            const runTest = require('../lib/test');
            return runTest(argv, platformId, command);
        },
    });

    sywac.boolean('--quiet, -q', {
        desc: 'Silence all outputs',
        defaultValue: false,
    });

    sywac.boolean('--verbose', {
        desc: 'Displays verbose logs',
        defaultValue: false
    });

    sywac.help();
    sywac.showHelpByDefault();

    sywac.version();

    sywac.configure({ name: 'kash' });

    // Register the global commands for the platform
    registerCommands(sywac, platform);

    applyStyles(sywac);
    
    return sywac.parse(process.argv.slice(2))
        .then((result) => {
            console.log(result.output);
            process.exit(result.code);
        })
        .catch(e => console.error(e));
}

firstPass()
    .then((result) => {
        // This won't run if secondPass is executed forom a run command
        if (result.argv.platform) {
            return secondPass(result.argv.platform);
        }
        console.log(result.output);
        process.exit(result.code);
    });
