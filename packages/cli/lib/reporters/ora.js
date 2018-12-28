const ora = require('ora');
const Reporter = require('./reporter');

class OraReporter extends Reporter {
    getSpinner() {
        if (!this.spinner || !this.spinner.isSpinning) {
            this.spinner = ora('').start();
        }
        return this.spinner;
    }
    onStep(message) {
        this.getSpinner().text = message;
    }
    onSuccess(message) {
        this.getSpinner().succeed(message);
    }
    onFailure(message) {
        this.getSpinner().fail(message);
    }
    onWarning(message) {
        this.getSpinner().warn(message);
    }
    onInfo(message) {
        this.getSpinner().info(message);
    }
    dispose() {
        this.getSpinner().stop();
    }
}

module.exports = OraReporter;
