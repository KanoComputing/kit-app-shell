
function setup(processState) {
    processState.on('step', ({ message = '' }) => {
        console.log(message);
    });
    processState.on('success', ({ message = '' }) => {
        console.log(message);
    });
    processState.on('failure', ({ message = '' }) => {
        console.error(message);
    });
    processState.on('warning', ({ message = '' }) => {
        console.log(message);
    });
    processState.on('info', ({ message = '' }) => {
        console.log(message);
    });
}

function stop() {
    getSpinner().stop();
}


module.exports = {
    setup,
    stop,
};
