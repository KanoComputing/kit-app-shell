#!/usr/bin/env node
const path = require('path');
const sywac = require('sywac');
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

return sywac.parse(process.argv.slice(2))
    .then(({ argv, output }) => {
        const [command, platformId] = argv._;

        if (!platformId) {
            // TODO: here generate the sywac default API and print usage with missing platform error
            return;
        }

        const platformCli = loadPlatformKey(platformId, 'cli');

        const platform = {
            cli: platformCli,
        };

        sywac.command(`build ${platformId}`, {
            desc: 'build the application',
            ignore: [platformId],
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

        sywac.command(`run ${platformId}`, {
            desc: 'run the application',
            ignore: [platformId],
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

        sywac.command(`test ${platformId}`, {
            desc: 'test the application',
            ignore: [platformId],
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
            desc: 'Silences all outputs',
            defaultValue: false,
        });

        sywac.boolean('--verbose', {
            desc: 'Displays verbose logs',
            defaultValue: false
        });

        sywac.help();

        sywac.configure({ name: 'kash' });

        // Register the global commands for the platform
        registerCommands(sywac, platform);

        sywac.style({
            group: s => chalk.cyan.bold(s),
            desc: s => chalk.white(s),
            hints: s => chalk.dim(s),
            flagsError: s => chalk.red(s),
        });
        
        return sywac.parse(process.argv.slice(2))
            .then((result) => {
                console.log(result.output);
                process.exit(result.code);
            })
            .catch(e => console.error(e));
    });
