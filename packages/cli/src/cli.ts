#!/usr/bin/env node
/* eslint no-console: 'off' */
import * as path from 'path';
import * as Api from 'sywac/api';
// Use the file directly. Might break when moving stuff but tests will tell us
// This saves a lot of time as the big modules for building are not loaded is not needed
import * as platformUtils from '@kano/kit-app-shell-core/lib/util/platform';
import { processState } from '@kano/kit-app-shell-core/lib/process-state';
import { RcLoader } from '@kano/kit-app-shell-core/lib/rc';
import { runChecks, ICheck, ICheckResult, CheckResultSatus } from '@kano/kit-app-shell-core/lib/check';
import { IDisposable, ICli, ICommand } from '@kano/kit-app-shell-core/lib/types';
import * as tmp from '@kano/kit-app-shell-core/lib/tmp';
import * as prettyBytes from 'pretty-bytes';
import chalk from 'chalk';
import { ISywac, IArgv } from './types';

type ProcessState = typeof processState;

/**
 * Parses inputs, runs the commands and report to the user
 */
class CLI {
    static parseEnv(sywac: ISywac): ISywac {
        return sywac
            .string('--env, -e', {
                desc: 'Target environment',
                defaultValue: 'development',
            });
    }
    static parseAppRoot(sywac: ISywac): ISywac {
        return sywac
            .positional('<app=./>', {
                params: [{
                    required: true,
                    desc: 'Path to the root of the app',
                    coerce: path.resolve,
                }],
            });
    }
    static parseAppBuild(sywac: ISywac): ISywac {
        return sywac
            .positional('<build>', {
                params: [{
                    required: true,
                    desc: 'Path to the built app',
                    coerce: path.resolve,
                }],
            });
    }
    static parseOverrideAppConfig(sywac: ISywac): ISywac {
        return sywac
            .array('-C, --override-app-config <values..>', {
                desc: 'Override app configuration (syntax key.subkey=value)',
                /**
                 * Transforms an array of key.subkey=value pairs into an object
                 * structure with those resolved:  { key: { subkey: value } }
                 */
                coerce: (strings: string[]) => {
                    const overrides = {};
                    strings.forEach((s) => {
                        const [key, value] = s.split('=');
                        const keyComponents = key.split('.');

                        let currentLevel = overrides;
                        while (keyComponents.length > 1) {
                            const keyComponent = keyComponents.shift();
                            currentLevel[keyComponent] = currentLevel[keyComponent] || {};
                            currentLevel = currentLevel[keyComponent];
                        }

                        const topLevelKey = keyComponents[0];
                        currentLevel[topLevelKey] = value;
                    });

                    return overrides;
                },
            });
    }
    static parseRequireAppConfig(sywac: ISywac): ISywac {
        return sywac
            .array('-R, --require-config <path>', {
                desc: 'Require app configuration file',
                coerce: (strings: string[]) => {
                    return strings.map((s) => path.resolve(s));
                },
            });
    }
    static checkRequireAppConfig(sywac : ISywac) : ISywac {
        return sywac
            .check((argv) => {
                if (!argv.R) return;
                // async validation
                return argv.R.reduce((p : Promise<boolean>, path : string) => {
                    return p.then(() => {
                        return RcLoader.check(path).then((exists) => {
                            if (!exists) {
                                throw new Error(`-R: App config file does not exist: ${path}`);
                            }
                        });
                    });
                }, Promise.resolve(true));
            });
    }
    static applyStyles(sywac: ISywac): ISywac {
        return sywac.style({
            group: (s) => chalk.cyan.bold(s),
            desc: (s) => chalk.white(s),
            hints: (s) => chalk.dim(s),
            flagsError: (s) => chalk.red(s),
        });
    }
    static patchSywacOptions(sywac: ISywac, forcedOptions: any): IDisposable {
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
    processArgv: string[];
    startedAt: number;
    duration: number;
    reporter: import('./reporters/reporter').IReporter;
    processState: ProcessState = processState;
    constructor(processArgv) {
        this.processArgv = processArgv;
    }
    start(): Promise<void> {
        this.startedAt = Date.now();
        // Parse the output once to deal with command discovery and help
        return this.firstPass()
            .then((result) => {
                // Try to grab the platform from the argv
                const [, platform] = result.argv._;
                // This won't run if the user input a correct command with a platform
                if (platform) {
                    return this.secondPass(platform);
                }
                // tslint:disable-next-line:no-console
                console.log(result.output);
                return this.end(result.code);
            });
    }
    end(code: number): void {
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
    setTask(task: Promise<any>) {
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
    mountReporter(argv: IArgv): Promise<void> {
        if (argv.quiet) {
            return Promise.resolve();
        }
        let p: Promise<any>;
        // Avoid wasting people's time by loading only the necessary code
        if (process.stdout.isTTY) {
            // Use spinner UI for humans
            p = import('./reporters/ora');
        } else {
            // Use normal logging for machines (e.g. CI)
            p = import('./reporters/console');
        }
        return p
            .then((ReporterModule: { default: any }) => {
                this.reporter = (new ReporterModule.default()) as import('./reporters/reporter').IReporter;
                this.processState.on('step', ({ message = '' }) => this.reporter.onStep(message));
                this.processState.on('success', ({ message = '' }) => this.reporter.onSuccess(message));
                this.processState.on('failure', ({ message = new Error('') }) => this.reporter.onFailure(message));
                this.processState.on('warning', ({ message = '' }) => this.reporter.onWarning(message));
                this.processState.on('info', ({ message = '' }) => this.reporter.onInfo(message));
            });
    }
    runDoctor() {
        return import('@kano/kit-app-shell-core/lib/checks/index')
            .then((checkModule: { default: ICheck[] }) => {
                return runChecks(checkModule.default);
            });
    }
    displayDoctorResults(results: ICheckResult[]): void {
        const DOCTOR_SUCCESS_DEFAULT = 'All good';
        const DOCTOR_WARNING_DEFAULT = 'Warning';
        const DOCTOR_FAILURE_DEFAULT = 'Error';
        let failed = false;
        results.forEach((result) => {
            const message: string | null = result.message ? result.message.replace(/\n/g, '\n  ') : null;
            if (result.status === CheckResultSatus.Success) {
                processState.setSuccess(`${result.title}: ${message || DOCTOR_SUCCESS_DEFAULT}`);
            } else if (result.status === CheckResultSatus.Warning) {
                processState.setWarning(`${result.title}: ${message || DOCTOR_WARNING_DEFAULT}`);
            } else {
                processState.setFailure(`${result.title}: ${message || DOCTOR_FAILURE_DEFAULT}`);
                failed = true;
            }
        });
        this.end(failed ? 1 : 0);
    }
    firstPass(): Promise<any> {
        // Create local sywac
        const sywac = new Api();

        // All commands available
        const commands = ['run', 'build', 'sign', 'configure'];

        sywac.configure({ name: 'kash' });

        // Generate all commands with generic help message
        commands.forEach((cmd) => {
            sywac.command(`${cmd} <platform> --help`, {
                desc: `Show help for the ${cmd} command`,
                run: (argv) => this.secondPass(argv.platform),
            });
        });

        sywac.command('doctor [platform] --help', {
            desc: 'Show help for the doctor command',
            run: (argv) => {
                if (!argv.platform) {
                    return this.runDoctor();
                }
                return this.secondPass(argv.platform);
            },
        });

        sywac.command('cache', {
            desc: 'Manage the cache files used by kash',
            setup: (setup) => {
                setup.command('status', {
                    desc: 'Displays the status of the cache directory',
                    run: () => {
                        return tmp.status()
                            .then((status) => {
                                let total = 0;
                                Object.keys(status).forEach((key) => {
                                    const st = status[key];
                                    total += st.size;
                                    // tslint:disable-next-line:no-console
                                    console.log(`  ${key} size: ${prettyBytes(st.size)}`);
                                });
                                // tslint:disable-next-line:no-console
                                console.log(`  Total size: ${prettyBytes(total)}`);
                                if (total !== 0) {
                                    // tslint:disable-next-line:no-console
                                    console.log(`Run ${chalk.cyan('kash cache clear')} to free up some space`);
                                } else {
                                    // tslint:disable-next-line:no-console
                                    console.log('No cache to clear');
                                }
                            })
                            .then(() => this.end(0));
                    },
                });
                setup.command('clear', {
                    desc: 'Deletes the contents of the cache directory',
                    run: (argv) => {
                        return this.mountReporter(argv)
                            .then(() => tmp.status())
                            .then((status) => {
                                const total = Object.keys(status).reduce((acc, key) => {
                                    return acc + status[key].size;
                                }, 0);
                                return tmp.clear()
                                    .then(() => processState.setSuccess(`Cleared ${prettyBytes(total)}`));
                            });
                    },
                });
                setup.command('dir', {
                    desc: 'Displays the cache directory location',
                    run: () => {
                        // tslint:disable-next-line:no-console
                        console.log(tmp.getRootPath());
                    },
                });
            },
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
    secondPass(platformId: string): Promise<any> {
        const sywac = new Api();
        return platformUtils.loadPlatformKey(platformId, 'cli')
            .then((platformCli: ICli) => {
                const platform = {
                    cli: platformCli || {} as ICli,
                };

                sywac.command('build <platform>', {
                    desc: 'build the application',
                    setup: (s) => {
                        CLI.parseAppRoot(s);
                        CLI.parseEnv(s);
                        CLI.parseOverrideAppConfig(s);
                        CLI.parseRequireAppConfig(s);
                        CLI.checkRequireAppConfig(s);
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
                            })
                            .boolean('--skip-minify-html', {
                                aliases: ['skip-minify-html', 'skipMinifyHtml'],
                                defaultValue: false,
                            })
                            .boolean('--skip-babel', {
                                aliases: ['skip-babel', 'skipBabel'],
                                defaultValue: false,
                            })
                            .boolean('--skip-terser', {
                                aliases: ['skip-terser', 'skipTerser'],
                                defaultValue: false,
                            })
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
                        CLI.parseAppRoot(s);
                        CLI.parseEnv(s);
                        CLI.parseOverrideAppConfig(s);
                        CLI.parseRequireAppConfig(s);
                        CLI.checkRequireAppConfig(s);
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

                sywac.command('sign <platform>', {
                    desc: 'sign an application package',
                    setup: (s) => {
                        CLI.parseAppBuild(s);
                        CLI.parseEnv(s);
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

                sywac.command('doctor <platform>', {
                    desc: 'run system checks for a platform',
                    setup: (s) => {
                        const sywacPatch = CLI.patchSywacOptions(s, {
                            group: platform.cli.group || 'Platform: ',
                        });
                        platformUtils.registerOptions(s, platform, ICommand.Doctor);
                        sywacPatch.dispose();
                    },
                    run: (argv) => {
                        this.mountReporter(argv);
                        return import('./doctor')
                            .then((doctor) => {
                                const task = doctor.default(platformId)
                                    .then((checks) => runChecks(checks))
                                    .then((results) => this.displayDoctorResults(results));
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
