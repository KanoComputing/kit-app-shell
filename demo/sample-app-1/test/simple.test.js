const { assert } = require('chai');

describe('simple', () => {
    it('test1', () => {
        return kash.driver.waitForElementById('main')
        .then((el) => el.text())
        .then((t) => {
            assert.include(t, `Sample App 1 v1.0.0`);
        });
    });
    it('test2', () => {
        return kash.driver.waitForElementById('click')
            .then((el) => el.click());
    });
});
