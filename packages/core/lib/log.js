const { DEBUG } = process.env;

function noop() {}

module.exports = {
    trace: DEBUG ? console.log : noop,
    debug: DEBUG ? console.log : noop,
    info: console.log,
    warn: console.warn,
    error: console.error,
};
