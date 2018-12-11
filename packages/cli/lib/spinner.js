const ora = require('ora');

let spinner;

function getSpinner() {
    if (!spinner || !spinner.isSpinning) {
        spinner = ora('').start();
    }
    return spinner;
}

function setup(processState) {
    processState.on('step', ({ message = '' }) => {
        getSpinner().text = message;
    });

    processState.on('success', ({ message = '' }) => {
        getSpinner().succeed(message);
    });

    processState.on('failure', ({ message = '' }) => {
        getSpinner().fail(message.stack || message);
    });

    processState.on('warning', ({ message = '' }) => {
        getSpinner().warn(message);
    });

    processState.on('info', ({ message = '' }) => {
        getSpinner().info(message);
    });
}

function stop() {
    getSpinner().stop();
}

module.exports = {
    setup,
    stop,
};
