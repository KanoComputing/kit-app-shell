/* globals suite, test, teardown */

import * as mock from 'mock-require';
import { assert } from 'chai';
import { WindowsStoreBuildOptions } from './types';

const noCertSample : WindowsStoreBuildOptions = {
    app: '/',
    out: '/',
    config: {
        APP_ID: 'com.kano.test',
        APP_NAME: 'Test',
        WINDOWS_STORE: {
            PUBLISHER: 'CN=TEST',
        },
    },
    windowsKit: '/',
};

const certStoreSample : WindowsStoreBuildOptions = {
    ...noCertSample,
    certificates: {
        'CN=TEST': '/cert.pfx',
    },
};

suite('build', () => {
    setup(() => {
        mock('@kano/kit-app-shell-windows/lib/build', {
            default: (opts) => {
                return Promise.resolve('/');
            },
        });
        mock('rimraf', (_, cb) => cb());
        mock('mkdirp', (_, cb) => cb());
    });
    test('Disables updater', () => {
        mock('electron-windows-store', () => Promise.resolve());

        const build = mock.reRequire('./build');

        return build.default(certStoreSample);
    });
    test('uses generated devCert', () => {
        mock('electron-windows-store', (p) => {
            assert.equal(p.devCert, '/cert.pfx');
            return Promise.resolve();
        });

        const build = mock.reRequire('./build');

        return build.default(certStoreSample);
    });
    test('uses generated devCert', () => {
        mock('electron-windows-store', (p) => {
            assert.equal(p.devCert, '/cert.pfx');
            return Promise.resolve();
        });

        const build = mock.reRequire('./build');

        return build.default({ ...noCertSample, devCert: '/cert.pfx' });
    });
    teardown(() => {
        mock.stopAll();
    });
});
