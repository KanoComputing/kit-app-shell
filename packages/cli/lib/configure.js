const { prompt } = require('enquirer');
const deepMerge = require('deepmerge');
const { util, RcLoader, log } = require('@kano/kit-app-shell-core');
const chalk = require('chalk');

module.exports = function configure(argv, platformId, command) {
    const platformConfigure = util.platform.loadPlatformKey(platformId, 'configure');
    log.info(`Configuring options for platform ${platformId}`);
    return RcLoader.loadHomeRc()
        .then((cfg) => {
            if (typeof platformConfigure.enquire !== 'function') {
                return;
            }
            return platformConfigure.enquire(prompt, cfg[platformId] || {})
                .then((answers) => {
                    if (typeof platformConfigure.generate !== 'function') {
                        return answers;
                    }
                    return platformConfigure.generate(answers);
                })
                .then((answers) => {
                    const scopedAnswers = {
                        [platformId]: answers || {},
                    };
                    return deepMerge(cfg, scopedAnswers);
                })
                .then((updatedCfg) => RcLoader.saveHomeRc(updatedCfg))
                .then(() => {
                    log.info(`Your local config has been updated. Use ${chalk.cyan('kash open config')} to see it`);
                });
        });
};
