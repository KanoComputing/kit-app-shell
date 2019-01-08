"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const util_1 = require("util");
const mkdripCb = require("mkdirp");
const mkdirp = util_1.promisify(mkdripCb);
const readFile = util_1.promisify(fs.readFile);
const writeFile = util_1.promisify(fs.writeFile);
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
            .then(contents => JSON.parse(contents))
            .catch(() => ({}))
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
            .then((cache) => {
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
exports.ProjectCacheManager = ProjectCacheManager;
//# sourceMappingURL=cache.js.map