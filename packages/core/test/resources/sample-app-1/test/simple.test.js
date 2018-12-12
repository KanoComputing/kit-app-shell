const { assert } = require('chai');

describe('simple', () => {
    it('test1', () => {
        return kash.driver.findElement(kash.webdriver.By.css('body>div'))
            .then((elHandle) => elHandle.getText())
            .then((t) => {
                assert.include(t, `Sample App 1 v1.0.0`);
            });
    });
    it('test1', () => {
        return kash.driver.findElement(kash.webdriver.By.css('body>div'))
            .then((elHandle) => elHandle.getText())
            .then((t) => {
                assert.include(t, `Sample App 1 v1.0.0`);
            });
    });
    it('test1', () => {
        return kash.driver.findElement(kash.webdriver.By.css('body>div'))
            .then((elHandle) => elHandle.getText())
            .then((t) => {
                assert.include(t, `Sample App 1 v1.0.0`);
            });
    });
    it('test1', () => {
        return kash.driver.findElement(kash.webdriver.By.css('body>div'))
            .then((elHandle) => elHandle.getText())
            .then((t) => {
                assert.include(t, `Sample App 1 v1.0.0`);
            });
    });
    it('test1', () => {
        return kash.driver.findElement(kash.webdriver.By.css('body>div'))
            .then((elHandle) => elHandle.getText())
            .then((t) => {
                assert.include(t, `Sample App 1 v1.0.0`);
            });
    });
});
