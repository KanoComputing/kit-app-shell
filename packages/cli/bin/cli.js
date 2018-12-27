#!/usr/bin/env node
const path = require('path');
const Api = require('sywac/Api');
const { processState, util } = require('@kano/kit-app-shell-core');
const chalk = require('chalk');

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

function patchSywacOptions(sywac, forcedOptions) {
    const originalOptions = sywac._addOptionType.bind(sywac);
    sywac._addOptionType = (flags, opts, type) => {
        return originalOptions(flags, Object.assign({}, opts, forcedOptions), type);
    };
    return {
        dispose() {
            sywac._addOptionType = originalOptions;
        }
    };
}

function firstPass() {
    // Create local sywac
    const sywac = new Api();

    // All commands available
    const commands = ['run', 'build', 'test', 'configure'];

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

    sywac.command('open config', {
        desc: 'Open the location of your configuration',
        run(argv) {
            return require('../lib/open-config')();
        },
    });

    sywac.help();
    sywac.showHelpByDefault();

    sywac.version();

    applyStyles(sywac);

    return sywac.parse(process.argv.slice(2));
}

function secondPass(platformId) {
    const sywac = new Api();
    let platformKey;
    // catch synchronous error and reject as a result
    try {
        platformCli = util.platform.loadPlatformKey(platformId, 'cli');
    } catch (e) {
        let context = sywac.initContext(false);
        context.unexpectedError(e);
        const result = context.toResult();
        console.log(result.output);
        process.exit(result.code);
    }

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
                    aliases: ['n', 'build-number', 'buildNumber'],
                    defaultValue: 0,
                })
                .boolean('--bundle-only', {
                    aliases: ['bundle-only', 'bundleOnly'],
                    defaultValue: false,
                });
            const sywacPatch = patchSywacOptions(sywac, { group: platform.cli.group || 'Platform: ' });
            util.platform.registerOptions(sywac, platform, 'build');
            sywacPatch.dispose();
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
            const sywacPatch = patchSywacOptions(sywac, { group: platform.cli.group || 'Platform: ' });
            util.platform.registerOptions(sywac, platform, 'run');
            sywacPatch.dispose();
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
                aliases: ['prebuilt-app', 'prebuiltApp'],
                desc: 'Path to the built app to test',
                required: true,
                coerce: path.resolve,
            });
            const sywacPatch = patchSywacOptions(sywac, { group: platform.cli.group || 'Platform: ' });
            util.platform.registerOptions(sywac, platform, 'test');
            sywacPatch.dispose();
        },
        run(argv) {
            mountUI(argv);
            const runTest = require('../lib/test');
            return runTest(argv, platformId, 'test');
        },
    });

    sywac.command(`configure <platform>`, {
        desc: 'configure kash',
        setup(sywac) {
            const sywacPatch = patchSywacOptions(sywac, { group: platform.cli.group || 'Platform: ' });
            util.platform.registerOptions(sywac, platform, 'configure');
            sywacPatch.dispose();
        },
        run(argv) {
            mountUI(argv);
            const configure = require('../lib/configure');
            return configure(argv, platformId, 'configure');
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
    const sywacPatch = patchSywacOptions(sywac, { group: platform.cli.group || 'Platform: ' });
    util.platform.registerCommands(sywac, platform);
    sywacPatch.dispose();

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
        // This won't run if secondPass is executed from a run command
        if (result.argv.platform) {
            return secondPass(result.argv.platform);
        }
        console.log(result.output);
        process.exit(result.code);
    });
