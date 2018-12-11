const state = require('./process-state');
const { assert } = require('chai');

// TODO: Make it readable. This effectively tests all events, but in a callback hell
suite('ProcessState', () => {
    test('events', (done) => {
        const stepMessage = Symbol();
        const successMessage = Symbol();
        const failureMessage = Symbol();
        const warningMessage = Symbol();
        const infoMessage = Symbol();
        state.on('step', (e) => {
            assert.equal(e.message, stepMessage);
            state.on('success', (e) => {
                assert.equal(e.message, successMessage);
                state.on('failure', (e) => {
                    assert.equal(e.message, failureMessage);
                    state.on('warning', (e) => {
                        assert.equal(e.message, warningMessage);
                        state.on('info', (e) => {
                            assert.equal(e.message, infoMessage);
                            done();
                        });
                        state.setInfo(infoMessage);
                    });
                    state.setWarning(warningMessage);
                });
                state.setFailure(failureMessage);
            });
            state.setSuccess(successMessage);
        });
        state.setStep(stepMessage);
    });
});
