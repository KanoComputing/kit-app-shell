"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const wd = require("wd");
const Mocha = require("mocha");
const util_1 = require("util");
const globCb = require("glob");
const glob = util_1.promisify(globCb);
class KashTestFramework {
    constructor() {
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
            .then(ctxs => this.driver.context(ctxs[1]));
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
exports.test = (platform, opts) => {
    const framework = new KashTestFramework();
    Mocha.interfaces['selenium-bdd'] = (suite) => {
        Mocha.interfaces.bdd(suite);
        suite.on('pre-require', (context) => {
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
    const mocha = new Mocha();
    mocha.ui('selenium-bdd');
    mocha.timeout(240000);
    mocha.suite.afterAll(() => framework.dispose());
    return platform.getBuilder(wd, mocha, opts)
        .then((builder) => {
        framework._setBuilder(builder);
        return Promise.all((opts.spec || []).map(s => glob(s, { cwd: opts.app })))
            .then((specFiles) => {
            const allFiles = specFiles.reduce((acc, it) => acc.concat(it), []);
            allFiles.forEach((file) => {
                mocha.addFile(path.join(opts.app, file));
            });
            const runner = mocha.run();
            return new Promise((resolve, reject) => {
                runner.on('end', () => {
                    resolve();
                });
                runner.on('error', reject);
            });
        });
    });
};
//# sourceMappingURL=test.js.map