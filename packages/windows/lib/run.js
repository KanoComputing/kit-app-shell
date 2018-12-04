const { run } = require('@kano/kit-app-shell-electron');

module.exports = (opts, commandOpts) => {
    return run(opts, commandOpts, 'windows');
};
