const { promisify } = require('util');
const sign = promisify(require('electron-osx-sign'));

/**
 * Use electron-osx-sign and pass the filename as app
 */
module.exports = opts => sign({ app: opts.app });
