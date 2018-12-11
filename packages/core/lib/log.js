const logging = require('./logging');

const { DEBUG } = process.env;

function noop() {}

// Use logging as console. Reliably stub it during tests
module.exports = {
    trace: DEBUG ? logging.log : noop,
    debug: DEBUG ? logging.log : noop,
    info: logging.log,
    warn: logging.warn,
    error: logging.error,
};
