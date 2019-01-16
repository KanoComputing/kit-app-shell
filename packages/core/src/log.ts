import { logging } from './logging';

const { DEBUG } = process.env;

const noop = (...args : any[]) => null;

// Use logging as console. Reliably stub it during tests
export const log = {
    trace: DEBUG ? logging.log : noop,
    debug: DEBUG ? logging.log : noop,
    info: logging.log,
    warn: logging.warn,
    error: logging.error,
};
