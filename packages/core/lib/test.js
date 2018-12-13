const path = require('path');
const wd = require('wd');
const Mocha = require('mocha');
const { promisify } = require('util');
const glob = promisify(require('glob'));

class KashTestFramework {
    constructor(builder) {
        // TODO: Add features to control API through web-bus
        this._builder = builder;
        this.wd = wd;
    }
    _beforeEach() {
        return this._builder()
            .then((d) => {
                this.driver = d;
            });
    }
    _afterEach() {
        if (!this.driver) {
            return Promise.resolve();
        }
        return this.driver.quit();
    }
}

module.exports = (platform, opts, commandOpts) => {
    return platform.getBuilder(wd, opts, commandOpts)
        .then((builder) => {
            const framework = new KashTestFramework(builder);
            // Create new mocha UI inhecting the test framework 
            Mocha.interfaces['selenium-bdd'] = (suite) => {
                Mocha.interfaces.bdd(suite);
                suite.on('pre-require', function(context, file, mocha) {
                    context.kash = framework;
                });
                suite.beforeEach(function () {
                    this.timeout(30000);
                    return framework._beforeEach();
                });
                suite.afterEach(() => {
                    return framework._afterEach();
                });
            };
            // TODO: customise mocha through command options
            const mocha = new Mocha({
                ui: 'selenium-bdd',
                timeout: 60000,
            });
            // Grab all spec files using glob
            // TODO: research and mimic mocha's glob behaviour for consistency (e.g. minimist)
            return Promise.all((commandOpts.spec || []).map(s => glob(s, { cwd: opts.app })))
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
                            resolve();
                        });
                        runner.on('error', reject);
                    });
                });
        });    
};
