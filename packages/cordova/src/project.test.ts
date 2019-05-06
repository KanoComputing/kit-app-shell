/* globals suite, setup, test, teardown */
import * as mockFs from 'mock-fs';
import * as mock from 'mock-require';
import * as chai from 'chai';
import * as path from 'path';
import chaiFs = require('chai-fs');

chai.use(chaiFs);

const { assert } = chai;

const TEST_CONFIG = {
    APP_ID: 'com.test.app',
    APP_NAME: 'App Name',
};

const MOCK_DEFAULTS = { createCwd: false, createTmp: false };

suite('project', () => {
    suite('getProject()', () => {
        setup(() => {
            mock('sharp', {});
            mock('./util', {
                getModulePath(mod) {
                    return mod;
                },
            });
            mock('os', {
                tmpdir() {
                    return '/test-tmp';
                },
                platform() {
                    return null;
                },
                homedir() {
                    return '/test-homedir';
                },
            });
            mock('./chdir', {
                chdir: () => null,
            });
        });
        test('existing project', () => {
            class CacheClassMock {
                static configToHash() {
                    return 'hash';
                }
                getProject() {
                    return Promise.resolve('/project');
                }
            }
            const CacheMock = {
                ProjectCacheManager: CacheClassMock,
            };
            mock('cordova-lib', {
                cordova: {
                    create() {
                        throw new Error('Should not create a new project when a cached one is available');
                    },
                },
            });
            mock('@kano/kit-app-shell-core/lib/cache', CacheMock);
            const { getProject } = mock.reRequire('./project');
            mockFs({
                '/project': mockFs.directory({ items: {} }),
            }, MOCK_DEFAULTS);
            return getProject({
                app: '/app',
                config: TEST_CONFIG,
                cacheId: 'test',
                platforms: [],
                plugins: [],
                hooks: {},
            }, {});
        });
        test('non-existing project', () => {
            // Runs the build script in a sandbox ( No fs, fake cache, ... )
            // Expect the project creation steps to run in order with the right properties
            const expectedProjectPath = path.normalize('/test-tmp/kash/cache/test/hash/project');
            const expectedSteps = [
                'get-project',
                'create',
                'platform',
                'plugin',
                'prepare',
                'set-project',
            ];
            // Store steps in order they run. They will be checked against the expected steps array
            const steps = [];
            const testPlatforms = Symbol('platform');
            const testPlugin = Symbol('plugin');

            class CacheClassMock {
                static configToHash() {
                    return 'hash';
                }
                getProject() {
                    steps.push('get-project');
                    return Promise.resolve(null);
                }
                setProject() {
                    steps.push('set-project');
                    return Promise.resolve();
                }
            }
            const CacheMock = {
                ProjectCacheManager: CacheClassMock,
            };
            class MockCordovaConfigClass {
                addHook() {}
                setPreference() {}
                write() {
                    return Promise.resolve();
                }
            }
            const MockCordovaConfig = {
                CordovaConfig: MockCordovaConfigClass,
            };
            mock('cordova-lib', {
                cordova: {
                    create(projectPath, id, name) {
                        steps.push('create');
                        assert.equal(projectPath, path.resolve(expectedProjectPath));
                        assert.equal(id, TEST_CONFIG.APP_ID);
                        assert.equal(name, 'App Name');
                        return Promise.resolve();
                    },
                    platform(action, platforms) {
                        assert.equal(action, 'add');
                        // The platforms must match the provided set
                        assert.equal(platforms, testPlatforms);
                        steps.push('platform');
                    },
                    plugin(action, plugins) {
                        assert.equal(action, 'add');
                        // Default pluign for cordova must be in there
                        assert(plugins.indexOf('cordova-plugin-bluetoothle') !== -1);
                        assert(plugins.indexOf('cordova-plugin-device') !== -1);
                        assert(plugins.indexOf('cordova-plugin-splashscreen') !== -1);
                        // Provided plugin must also be there
                        assert(plugins.indexOf(testPlugin) !== -1);
                        steps.push('plugin');
                    },
                    prepare(opts) {
                        assert.containsAllKeys(opts, ['shell']);
                        assert.containsAllKeys(opts.shell, ['config', 'processState']);
                        steps.push('prepare');
                    },
                },
            });
            mock('@kano/kit-app-shell-core/lib/cache', CacheMock);
            mock('./cordova-config', MockCordovaConfig);
            const { getProject } = mock.reRequire('./project');
            mockFs({
                '/project': mockFs.directory({ items: {} }),
            }, MOCK_DEFAULTS);
            return getProject({
                app: '/app',
                config: TEST_CONFIG,
                cacheId: 'test',
                platforms: testPlatforms,
                plugins: [testPlugin],
                hooks: {},
            }, {}).then(() => {
                assert.deepEqual(steps, expectedSteps);
            });
        });
        teardown(() => {
            mock.stopAll();
            mockFs.restore();
        });
    });
});
