/* globals suite, test */
import { ProgressTracker } from './progress';
import { assert } from 'chai';

suite('ProgressTracker', () => {
    test('plugin()', (done) => {
        const testFile = 'file';
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
