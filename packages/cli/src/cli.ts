#!/usr/bin/env node
/* eslint no-console: 'off' */
import * as path from 'path';
import * as Api from 'sywac/api';
// Use the file directly. Might break when moving stuff but tests will tell us
// This saves a lot of time as the big modules for building are not loaded is not needed
import * as platformUtils from '@kano/kit-app-shell-core/lib/util/platform';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { IDisposable, ICli, ICommand } from '@kano/kit-app-shell-core/lib/types';
import chalk from 'chalk';
import { ISywac, IArgv } from './types';

type ProcessState = typeof processState;

/**
 * Parses inputs, runs the commands and report to the user
 */
class CLI {
    static parseCommon(sywac : ISywac) : ISywac {
        return sywac
            .positional('[app=./]', {
                params: [{
                    required: true,
                    desc: 'Path to the root of the app',
                    coerce: path.resolve,
                }],
            })
            .string('--env, -e', {
                desc: 'Target environment',
                defaultValue: 'development',
            });
    }
    static applyStyles(sywac : ISywac) : ISywac {
        return sywac.style({
            group: (s) => chalk.cyan.bold(s),
            desc: (s) => chalk.white(s),
            hints: (s) => chalk.dim(s),
            flagsError: (s) => chalk.red(s),
        });
    }
    static patchSywacOptions(sywac : ISywac, forcedOptions : any) : IDisposable {
        const originalOptions = sywac._addOptionType.bind(sywac);
        sywac._addOptionType = (flags, opts, type) => originalOptions(
            flags,
            Object.assign({}, opts, forcedOptions),
            type,
        );
        return {
            dispose() {
                sywac._addOptionType = originalOptions;
            },
        };
    }
    processArgv : string[];
    startedAt : number;
    duration : number;
    reporter : import('./reporters/reporter').IReporter;
    processState : ProcessState = processState;
    constructor(processArgv) {
        this.processArgv = processArgv;
    }
    start() : Promise<void> {
        this.startedAt = Date.now();
        // Parse the output once to deal with command discovery and help
        return this.firstPass()
            .then((result) => {
                // This won't run if the user input a correct command with a platform
                if (result.argv.platform) {
                    return this.secondPass(result.argv.platform);
                }
                // tslint:disable-next-line:no-console
                console.log(result.output);
                return this.end(result.code);
            });
    }
    end(code : number) : void {
        this.duration = Date.now() - this.startedAt;
        const totalTime = this.duration / 1000;
        const totalMinutes = Math.floor(totalTime / 60);
        const totalSeconds = (totalTime % 60).toFixed(2);
        const msg = `Done in ${totalMinutes}m${totalSeconds.toString().padStart(5, '0')}s.`;
        if (this.reporter) {
            this.reporter.onInfo(msg);
        }
        process.exit(code);
    }
    /**
     * Catches errors from the current task and notify the process state
     * @param {Promise} task current long running task
     */
    setTask(task : Promise<any>) {
        if (!this.processState) {
            return;
        }
        task.catch((e) => {
            this.processState.setFailure(e);
            // Caught errors here are displayed using the reporter and we end the process
            // This will skip sywac's logging and avoid duplicated error messages
            // TODO: Map out error codes and use them here. Embed the code in the error object
            return this.end(1);
        });
    }
    mountReporter(argv : IArgv) : Promise<void> {
        if (argv.quiet) {
            return Promise.resolve();
        }
        let p : Promise<any>;
        // Avoid wasting people's time by loading only the necessary code
        if (process.stdout.isTTY) {
            // Use spinner UI for humans
            p = import('./reporters/ora');
        } else {
            // Use normal logging for machines (e.g. CI)
            p = import('./reporters/console');
        }
        return p
            .then((ReporterModule : { default : any }) => {
                this.reporter = (new ReporterModule.default()) as import('./reporters/reporter').IReporter;
                this.processState.on('step', ({ message = '' }) => this.reporter.onStep(message));
                this.processState.on('success', ({ message = '' }) => this.reporter.onSuccess(message));
                this.processState.on('failure', ({ message = new Error('') }) => this.reporter.onFailure(message));
                this.processState.on('warning', ({ message = '' }) => this.reporter.onWarning(message));
                this.processState.on('info', ({ message = '' }) => this.reporter.onInfo(message));
            });
    }
    firstPass() : Promise<any> {
        // Create local sywac
        const sywac = new Api();

        // All commands available
        const commands = ['run', 'build', 'test', 'sign', 'configure'];

        sywac.configure({ name: 'kash' });

        // Generate all commands with generic help message
        commands.forEach((cmd) => {
            sywac.command(`${cmd} <platform> --help`, {
                desc: `Show help for the ${cmd} command`,
                run: (argv) => this.secondPass(argv.platform),
            });
        });

        // Allow custom commands from the platform itself
        sywac.positional('<command> <platform> --help', {
            desc: 'A platform command',
            run: (argv) => this.secondPass(argv.platform),
        });

        sywac.command('open config', {
            desc: 'Open the location of your configuration',
            run: () => {
                return import('./open-config')
                    .then((openConfig) => openConfig.default());
            },
        });

        sywac.help('-h, --help');
        sywac.showHelpByDefault();

        sywac.version();

        CLI.applyStyles(sywac);

        return sywac.parse(this.processArgv);
    }
    secondPass(platformId : string) : Promise<any> {
        const sywac = new Api();
        return platformUtils.loadPlatformKey(platformId, 'cli')
            .then((platformCli : ICli) => {
                const platform = {
                    cli: platformCli || {} as ICli,
                };

                sywac.command('build <platform>', {
                    desc: 'build the application',
                    setup: (s) => {
                        CLI.parseCommon(s);
                        s.array('--resources')
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
                        const sywacPatch = CLI.patchSywacOptions(s, {
                            group: platform.cli.group || 'Platform: ',
                        });
                        platformUtils.registerOptions(s, platform, ICommand.Build);
                        sywacPatch.dispose();
                    },
                    run: (argv) => {
                        this.mountReporter(argv);
                        return import('./command')
                            .then((runCommand) => {
                                const task = runCommand.default('build', platformId, argv);
                                this.setTask(task);
                                return task;
                            });
                    },
                });

                sywac.command('run <platform>', {
                    desc: 'run the application',
                    setup: (s) => {
                        CLI.parseCommon(s);
                        const sywacPatch = CLI.patchSywacOptions(s, {
                            group: platform.cli.group || 'Platform: ',
                        });
                        platformUtils.registerOptions(s, platform, ICommand.Run);
                        sywacPatch.dispose();
                    },
                    run: (argv) => {
                        this.mountReporter(argv);
                        return import('./command')
                            .then((runCommand) => {
                                const task = runCommand.default('run', platformId, argv);
                                this.setTask(task);
                                return task;
                            });
                    },
                });

                sywac.command('test <platform>', {
                    desc: 'test the application',
                    setup: (s) => {
                        CLI.parseCommon(s);
                        s.string('--prebuilt-app', {
                            aliases: ['prebuilt-app', 'prebuiltApp'],
                            desc: 'Path to the built app to test',
                            required: true,
                            coerce: path.resolve,
                        });
                        const sywacPatch = CLI.patchSywacOptions(s, {
                            group: platform.cli.group || 'Platform: ',
                        });
                        platformUtils.registerOptions(s, platform, ICommand.Test);
                        sywacPatch.dispose();
                    },
                    run: (argv) => {
                        this.mountReporter(argv);
                        return import('./test')
                            .then((runTest) => {
                                const task = runTest.default(argv, platformId, 'test');
                                this.setTask(task);
                                return task;
                            });
                    },
                });

                sywac.command('sign <platform>', {
                    desc: 'sign an application package',
                    setup: (s) => {
                        CLI.parseCommon(s);
                        const sywacPatch = CLI.patchSywacOptions(s, {
                            group: platform.cli.group || 'Platform: ',
                        });
                        platformUtils.registerOptions(s, platform, ICommand.Sign);
                        sywacPatch.dispose();
                    },
                    run: (argv) => {
                        this.mountReporter(argv);
                        return import('./command')
                            .then((runCommand) => {
                                const task = runCommand.default('sign', platformId, argv);
                                this.setTask(task);
                                return task;
                            });
                    },
                });

                sywac.command('configure <platform>', {
                    desc: 'configure kash',
                    setup: (s) => {
                        const sywacPatch = CLI.patchSywacOptions(s, {
                            group: platform.cli.group || 'Platform: ',
                        });
                        platformUtils.registerOptions(s, platform, ICommand.Configure);
                        sywacPatch.dispose();
                    },
                    run: (argv) => {
                        this.mountReporter(argv);
                        return import('./configure')
                            .then((configure) => {
                                const task = configure.default(platformId);
                                this.setTask(task);
                                return task;
                            });
                    },
                });

                sywac.boolean('--quiet, -q', {
                    desc: 'Silence all outputs',
                    defaultValue: false,
                });

                sywac.boolean('--verbose', {
                    desc: 'Displays verbose logs',
                    defaultValue: false,
                });

                sywac.help('-h, --help');
                sywac.showHelpByDefault();

                sywac.version();

                sywac.configure({ name: 'kash' });

                // Register the global commands for the platform
                const sywacPatcher = CLI.patchSywacOptions(sywac, {
                    group: platform.cli.group || 'Platform: ',
                });
                platformUtils.registerCommands(sywac, platform);
                sywacPatcher.dispose();

                CLI.applyStyles(sywac);

                return sywac.parse(this.processArgv)
                    .then((result) => {
                        if (result.output.length) {
                            // tslint:disable-next-line:no-console
                            console.log(result.output);
                        }
                        this.end(result.code);
                    });
            });
    }
}

const cli = new CLI(process.argv.slice(2));

cli.start();
