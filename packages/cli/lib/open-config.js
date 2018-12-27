const { promisify } = require('util');
const openExplorer = promisify(require('open-file-explorer'));
const { RcLoader } = require('@kano/kit-app-shell-core');

module.exports = function openConfig() {
    return openExplorer(RcLoader.RC_PATH);
};
