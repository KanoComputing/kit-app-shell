import * as path from 'path';
import * as fs from 'fs';
import * as wd from 'wd';
import * as Mocha from 'mocha';
import { promisify } from 'util';
import * as globCb from 'glob';
import { TestOptions, IBuilderFactory } from './types';
import * as mkdirpCb from 'mkdirp';

const glob = promisify(globCb);
const mkdirp = promisify(mkdirpCb);
const writeFile = promisify(fs.writeFile);

export function switchContexts(driver : wd.WebDriver, index : number) {
    const asserter = new wd.Asserter<wd.Context[]>((target, cb) => {
        driver.contexts()
            .then((ctxs) => {
                cb(null, ctxs.length > 1, ctxs);
            })
            .catch((e) => cb(e));
    });
    return driver.waitFor<wd.Context[]>(asserter)
        .then((ctxs) => driver.context(ctxs[index]));
}

export interface IKashTestFrameworkOptions {
    screenshotsPath : string|null;
}

class DefaultKashTestFramework {
    public wd : typeof wd;
    public driver? : wd.WebDriver;
    private screenshotsPath : string|null;
    constructor(opts : IKashTestFrameworkOptions) {
        this.screenshotsPath = opts.screenshotsPath;
        // TODO: Add features to control API through web-bus
        this.wd = wd;
    }
    _setDriver(driver : wd.WebDriver) {
        this.driver = driver;
    }
    _beforeEach(t? : Mocha.Test) {
        if (this.driver) {
            return Promise.resolve();
        }
        return Promise.reject('Could not initialize test: Driver is not defined');
    }
    _afterEach(t? : Mocha.Test) {
        // If the screenshot path is defined, wait for a bit
        if (this.screenshotsPath) {
            return (new Promise((resolve) => setTimeout(resolve, 1000)))
                .then(() => this.driver.takeScreenshot())
                .then((scr) => {
                    return mkdirp(this.screenshotsPath)
                    .then(() => writeFile(path.join(this.screenshotsPath, `${t.title}.png`), scr, 'base64'));
                });
        }
        return Promise.resolve();
    }
    dispose() {
        if (!this.driver) {
            return Promise.resolve();
        }
        return this.driver.quit();
    }
}

interface ITestPlatform {
    getBuilder : IBuilderFactory;
}

export const test = (platform : ITestPlatform, opts : TestOptions) => {
    const framework = new DefaultKashTestFramework({ screenshotsPath: opts.screenshots });
    // Create new mocha UI inhecting the test framework
    // @ts-ignore
    Mocha.interfaces['selenium-bdd'] = (suite : Mocha.Suite) => {
        Mocha.interfaces.bdd(suite);
        suite.on('pre-require', (context) => {
            // @ts-ignore
            context.kash = framework;
        });
    };
    // TODO: customise mocha through command options
    const mocha = new Mocha();
    mocha.ui('selenium-bdd');
    mocha.timeout(240000);
    if (opts.grep) {
        mocha.grep(opts.grep);
    }
    if (opts.fgrep) {
        mocha.fgrep(opts.fgrep);
    }
    if (opts.invert) {
        mocha.invert();
    }
    if (opts.reporter) {
        mocha.reporter(opts.reporter, opts.reporterOptions);
    }
    // After the main suite finished all tests, get rid of the framework
    // This needs to be registered here so that individual platforms defining their
    // builders can use the same lifecycle to stop whatever process they started after
    // the framework did its cleanup
    mocha.suite.afterAll(() => framework.dispose());
    return platform.getBuilder(wd, mocha, opts)
        .then((builder) => {
            return builder()
                .then((driver) => {
                    framework._setDriver(driver);
                })
                .then(() => {
                     // Grab all spec files using glob
                    // TODO: research and mimic mocha's glob behaviour for consistency (e.g. minimist)
                    return Promise.all((opts.spec || []).map((s) => glob(s, { cwd: opts.app })));
                })
                .then((specFiles) => {
                    // Merge all results
                    const allFiles = specFiles.reduce<string[]>((acc, it) => acc.concat(it), []);
                    // Add all files to the mocha instance
                    allFiles.forEach((file : string) => {
                        mocha.addFile(path.join(opts.app, file));
                    });
                    mocha.suite.beforeEach(function beforeEach() {
                        this.timeout(120000);
                        return framework._beforeEach(this.currentTest);
                    });
                    mocha.suite.afterEach(function afterEach() {
                        this.timeout(120000);
                        return framework._afterEach(this.currentTest);
                    });
                    // Start mocha
                    const runner = mocha.run();
                    return new Promise((resolve, reject) => {
                        // Kill driver at the end
                        runner.on('end', () => {
                            resolve();
                        });
                        runner.on('error', reject);
                    });
                });
        });
};
