/* globals suite, test, teardown */
const { assert } = require('chai');
const mock = require('mock-require');

suite('configure', () => {
    test('create certificate succesfully', () => {
        const promptMock = (input) => {
            switch (input.name) {
            case 'action': {
                return Promise.resolve({ action: 'create' });
            }
            case 'publisher': {
                return Promise.resolve({ publisher: 'CN=TEST' });
            }
            default: {
                return Promise.reject();
            }
            }
        };

        const signMock = {
            makeCert: () => Promise.resolve('/cert.pfx'),
        };

        const utilsMock = {
            getDefaultWindowsKitLocation: () => '/',
        };

        mock('electron-windows-store/lib/sign', signMock);
        mock('electron-windows-store/lib/utils', utilsMock);
        mock('rimraf', (_, cb) => cb());
        mock('mkdirp', (_, cb) => cb());

        const configure = mock.reRequire('./configure');

        return configure.enquire(promptMock, {})
            .then((answers) => {
                assert.containsAllKeys(answers, ['certificates', 'windowsKit']);
                assert.equal(answers.windowsKit, '/');
                assert.containsAllKeys(answers.certificates, 'CN=TEST');
                assert.equal(answers.certificates['CN=TEST'], '/cert.pfx');
            });
    });
    test('override certificate', () => {
        const promptMock = (input) => {
            switch (input.name) {
            case 'action': {
                return Promise.resolve({ action: 'create' });
            }
            case 'publisher': {
                return Promise.resolve({ publisher: 'CN=TEST' });
            }
            case 'confirmed': {
                return Promise.resolve({ confirmed: true });
            }
            default: {
                return Promise.reject();
            }
            }
        };

        const signMock = {
            makeCert: () => Promise.resolve('/cert.pfx'),
        };

        const utilsMock = {
            getDefaultWindowsKitLocation: () => '/',
        };

        mock('electron-windows-store/lib/sign', signMock);
        mock('electron-windows-store/lib/utils', utilsMock);
        mock('rimraf', (_, cb) => cb());
        mock('mkdirp', (_, cb) => cb());

        const configure = mock.reRequire('./configure');

        return configure.enquire(promptMock, {
            certificates: {
                'CN=TEST': '/test.pfx',
            },
        })
            .then((answers) => {
                assert.containsAllKeys(answers, ['certificates', 'windowsKit']);
                assert.equal(answers.windowsKit, '/');
                assert.containsAllKeys(answers.certificates, 'CN=TEST');
                assert.equal(answers.certificates['CN=TEST'], '/cert.pfx');
            });
    });
    teardown(() => {
        mock.stopAll();
    });
});
