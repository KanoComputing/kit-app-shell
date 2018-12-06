const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Caches a cordova project based on an app's config
 * Will always re-use a project to save time
 */
// TODO: TESTS !!!!!!!!!
class ProjectCacheManager {
    constructor(cacheId) {
        this._id = cacheId;
        this._dbPath = path.join(os.homedir(), '.kit-app-shell-cordova/cache', this._id);
    }
    load() {
        if (this._cache) {
            return Promise.resolve(this._cache);
        }
        return readFile(this._dbPath, 'utf-8')
            .then((contents) => JSON.parse(contents))
            .catch((e) => {
                // Any error up there, create a new cache
                return {};
            })
            .then((cache) => {
                this._cache = cache;
                return cache;
            });
    }
    save() {
        const contents = JSON.stringify(this._cache);
        return mkdirp(path.dirname(this._dbPath))
            .then(() => writeFile(this._dbPath, contents));
    }
    static configToHash(config) {
        return crypto.createHash('md5').update(JSON.stringify(config)).digest('hex');
    }
    getProject(config) {
        return this.load()
            .then((cache) =>{
                const hash = ProjectCacheManager.configToHash(config);
                return cache[hash];
            });
    }
    setProject(config, projectPath) {
        const hash = ProjectCacheManager.configToHash(config);
        return this.load()
            .then(() => {
                this._cache[hash] = projectPath;
                return this.save();
            });
    }
    deleteProject(config) {
        const hash = ProjectCacheManager.configToHash(config);
        return this.load()
            .then(() => {
                delete this._cache[hash];
                return this.save();
            });
    }
}

module.exports = ProjectCacheManager;
