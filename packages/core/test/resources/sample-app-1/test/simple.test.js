const { assert } = require('chai');

describe('simple', () => {
    it('test1', () => {
        return kash.driver.elementById('main')
            .then((el) => el.text())
            .then((t) => {
                assert.include(t, `Sample App 1 v1.0.0`);
            });
    });
    it('test1', () => {
        return kash.driver.elementById('click')
            .then((el) => el.click());
    });
});
