/* globals suite, test */
const { assert } = require('chai');
const { addRequirejs, replaceIndex } = require('./html');

suite('html.js', () => {
    test('addRequirejs', () => {
        const result = addRequirejs('<html><head></head></html>');
        assert.equal(
            '<html><head><script src="/require.js"></script></head><body></body></html>',
            result,
        );
    });
    test('replaceIndex', () => {
        const result = replaceIndex('/index.html', '/js/boot.js', '<html><body><script type="module" src="./js/boot.js"></script></body></html>');
        assert.equal(result.indexOf('type="module" src="./js/boot.js"'), -1, 'Original script wasn\'t replaced');
    });
});
