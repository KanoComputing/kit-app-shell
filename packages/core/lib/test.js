const path = require('path');
const wd = require('wd');
const Mocha = require('mocha');
const { promisify } = require('util');
const glob = promisify(require('glob'));

class KashTestFramework {
    constructor() {
        // TODO: Add features to control API through web-bus
        this.wd = wd;
    }
    _setBuilder(builder) {
        this._builder = builder;
    }
    _switchContexts() {
        const asserter = new wd.Asserter((target, cb) => {
            this.driver.contexts()
                .then((ctxs) => {
                    cb(null, ctxs.length > 1, ctxs);
                })
                .catch(e => cb(e));
        });
        return this.driver.waitFor(asserter)
                .then((ctxs) => this.driver.context(ctxs[1]));
    }
    _beforeEach(test) {
        if (this.driver) {
            return this.driver.resetApp()
                .then(() => this._switchContexts());
        }
        return this._builder(test)
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

module.exports = (platform, opts) => {
    const framework = new KashTestFramework();
    // Create new mocha UI inhecting the test framework 
    Mocha.interfaces['selenium-bdd'] = (suite) => {
        Mocha.interfaces.bdd(suite);
        suite.on('pre-require', function(context, file, mocha) {
            context.kash = framework;
        });
        suite.beforeEach(function () {
            this.timeout(120000);
            return framework._beforeEach(this.currentTest);
        });
        suite.afterEach(function () {
            this.timeout(120000);
            return framework._afterEach();
        });
    };
    // TODO: customise mocha through command options
    const mocha = new Mocha({
        ui: 'selenium-bdd',
        timeout: 240000,
    });
    return platform.getBuilder(wd, mocha, opts)
        .then((builder) => {
            framework._setBuilder(builder);
            // Grab all spec files using glob
            // TODO: research and mimic mocha's glob behaviour for consistency (e.g. minimist)
            return Promise.all((opts.spec || []).map(s => glob(s, { cwd: opts.app })))
                .then((specFiles) => {
                    // Merge all results
                    const allFiles = specFiles.reduce((acc, it) => acc.concat(it), []);
                    // Add all files to the mocha instance
                    allFiles.forEach((file) => {
                        mocha.addFile(path.join(opts.app, file));
                    });
                    // Start mocha
                    const runner = mocha.run();
                    return new Promise((resolve, reject) => {
                        // Kill driver at the end
                        runner.on('end', () => {
                            framework.dispose()
                                .then(() => resolve())
                                .catch(e => reject(e));
                        });
                        runner.on('error', reject);
                    });
                });
        });    
};
