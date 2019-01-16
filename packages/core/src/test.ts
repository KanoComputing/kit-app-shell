import * as path from 'path';
import * as wd from 'wd';
import * as Mocha from 'mocha';
import { promisify } from 'util';
import * as globCb from 'glob';
import { Builder, TestOptions, IBuilderFactory } from './types';

const glob = promisify(globCb);

class KashTestFramework {
    public wd : typeof wd;
    public driver? : wd.WebDriver;
    private builder? : Builder;
    constructor() {
        // TODO: Add features to control API through web-bus
        this.wd = wd;
    }
    _setBuilder(builder : Builder) {
        this.builder = builder;
    }
    _switchContexts() {
        if (!this.driver) {
            return Promise.reject('Could not switch contexts: Driver was notinitialized');
        }
        const driver = this.driver;
        const asserter = new wd.Asserter<wd.Context[]>((target, cb) => {
            driver.contexts()
                .then((ctxs) => {
                    cb(null, ctxs.length > 1, ctxs);
                })
                .catch((e) => cb(e));
        });
        return driver.waitFor<wd.Context[]>(asserter)
            .then((ctxs) => driver.context(ctxs[1]));
    }
    _beforeEach(t? : Mocha.Test) {
        if (this.driver) {
            return this.driver.resetApp()
                .then(() => this._switchContexts());
        }
        if (!this.builder) {
            return Promise.reject('Could not initialize test: Builder is not defined');
        }
        return this.builder(t)
            .then((d) => {
                this.driver = d;
                return this._switchContexts();
            });
    }
    _afterEach() {
        return Promise.resolve();
    }
    dispose() {
        if (!this.driver) {
            return Promise.resolve();
        }
        return this.driver.quit();
    }
}

export const test = (platform : { getBuilder : IBuilderFactory }, opts : TestOptions) => {
    const framework = new KashTestFramework();
    // Create new mocha UI inhecting the test framework
    // @ts-ignore
    Mocha.interfaces['selenium-bdd'] = (suite : Mocha.Suite) => {
        Mocha.interfaces.bdd(suite);
        suite.on('pre-require', (context) => {
            // @ts-ignore
            context.kash = framework;
        });
        suite.beforeEach(function beforeEach() {
            this.timeout(120000);
            return framework._beforeEach(this.currentTest);
        });
        suite.afterEach(function afterEach() {
            this.timeout(120000);
            return framework._afterEach();
        });
    };
    // TODO: customise mocha through command options
    const mocha = new Mocha();
    mocha.ui('selenium-bdd');
    mocha.timeout(240000);
    // After the main suite finished all tests, get rid of the framework
    // This needs to be registered here so that individual platforms defining their
    // builders can use the same lifecycle to stop whatever process they started after
    // the framework did its cleanup
    mocha.suite.afterAll(() => framework.dispose());
    return platform.getBuilder(wd, mocha, opts)
        .then((builder) => {
            framework._setBuilder(builder);
            // Grab all spec files using glob
            // TODO: research and mimic mocha's glob behaviour for consistency (e.g. minimist)
            return Promise.all((opts.spec || []).map((s) => glob(s, { cwd: opts.app })))
                .then((specFiles) => {
                    // Merge all results
                    const allFiles = specFiles.reduce<string[]>((acc, it) => acc.concat(it), []);
                    // Add all files to the mocha instance
                    allFiles.forEach((file : string) => {
                        mocha.addFile(path.join(opts.app, file));
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
