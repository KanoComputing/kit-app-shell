/* eslint no-console: 'off' */
const Reporter = require('./reporter');

class ConsoleReporter extends Reporter {
    onStep(message) {
        console.log(message);
    }
    onSuccess(message) {
        console.log(message);
    }
    onFailure(message) {
        console.error(message);
    }
    onWarning(message) {
        console.log(message);
    }
    onInfo(message) {
        console.log(message);
    }
}

module.exports = ConsoleReporter;
