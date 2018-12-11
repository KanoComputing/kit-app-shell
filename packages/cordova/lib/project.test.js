const mockFs = require('mock-fs');
const mock = require('mock-require');
const chai = require('chai');
const path = require('path');
const chaiFs = require('chai-fs');

chai.use(chaiFs);

const { assert } = chai;

const TEST_CONFIG = {
    APP_ID: 'com.test.app',
    APP_NAME: 'App Name',
};

suite('project', () => {
    suite('getProject()', () => {
        setup(() => {
            mock('sharp', {});
            mock('./util', {
                getModulePath() {
                    return '/';
                },
            });
        });
        test('existing project', () => {
            class CacheMock {
                getProject() {
                    return Promise.resolve('/project');
                }
                static configToHash() {
                    return 'hash';
                }
            }
            mock('cordova-lib', {
                cordova: {
                    create() {
                        throw new Error('Should not create a new project when a cached one is available');
                    }
                },
            });
            mock('./cache', CacheMock);
            const { getProject } = mock.reRequire('./project');
            mockFs({
                '/project': mockFs.directory(),
            });
            return getProject({
                app: '/app',
                config: TEST_CONFIG,
                cacheId: 'test',
                platforms: [],
                plugins: [],
                hooks: {}
            }, {});
        });
        test('non-existing project', () => {
            const expectedProjectPath = path.normalize('/test-tmp/kash-cordova-build/hash/project');
            class CacheMock {
                getProject() {
                    return Promise.resolve(null);
                }
                setProject() {
                    return Promise.resolve();
                }
                static configToHash() {
                    return 'hash';
                }
            }
            class MockCordovaConfig {
                addHook() {}
                write() {
                    return Promise.resolve();
                }
            }
            mock('os', {
                tmpdir() {
                    return '/test-tmp';
                },
            });
            mock('cordova-lib', {
                cordova: {
                    create(projectPath, id, name) {
                        assert.equal(projectPath, expectedProjectPath);
                        assert.equal(id, TEST_CONFIG.APP_ID);
                        assert.equal(name, 'AppName');
                    },
                    platform() {

                    },
                    plugin() {

                    },
                    prepare() {

                    },
                },
            });
            mock('./chdir', () => {});
            mock('./cache', CacheMock);
            mock('cordova-config', MockCordovaConfig);
            const { getProject } = mock.reRequire('./project');
            mockFs({
                '/project': mockFs.directory(),
            });
            return getProject({
                app: '/app',
                config: TEST_CONFIG,
                cacheId: 'test',
                platforms: [],
                plugins: [],
                hooks: {}
            }, {});
        });
        teardown(() => {
            mock.stopAll();
            mockFs.restore();
        });
    });
});
