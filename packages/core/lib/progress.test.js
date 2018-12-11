const ProgressTracker = require('./progress');
const { assert } = require('chai');

suite('ProgressTracker', () => {
    test('plugin()', (done) => {
        const testFile = Symbol();
        const tracker = new ProgressTracker();
        assert.equal(tracker.loaded, 0);
        tracker.on('progress', (e) => {
            assert.equal(e.loaded, 1);
            assert.equal(e.file, testFile);
            done();
        });
        const plugin = tracker.plugin();
        assert.equal(plugin.name, 'progress');
        plugin.load(testFile);
    });
});
