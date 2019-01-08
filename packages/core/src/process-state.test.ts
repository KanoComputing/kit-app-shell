/* globals suite, test */
import { processState as state } from './process-state';
import { assert } from 'chai';

// TODO: Make it readable. This effectively tests all events, but in a callback hell
suite('ProcessState', () => {
    test('events', (done) => {
        const stepMessage = 'step';
        const successMessage = 'success';
        const failureMessage = new Error('failure');
        const warningMessage = 'warning';
        const infoMessage = 'info';
        state.on('step', (e) => {
            assert.equal(e.message, stepMessage);
            state.on('success', (f) => {
                assert.equal(f.message, successMessage);
                state.on('failure', (g) => {
                    assert.equal(g.message, failureMessage);
                    state.on('warning', (h) => {
                        assert.equal(h.message, warningMessage);
                        state.on('info', (i) => {
                            assert.equal(i.message, infoMessage);
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
