import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';
import * as mkdripCb from 'mkdirp';

const mkdirp = promisify(mkdripCb);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Caches a cordova project based on an app's config
 * Will always re-use a project to save time
 */
export class ProjectCacheManager {
    _id : string;
    _dbPath : string;
    _cache : {};
    /**
     * The cacheId is a root key to group cached projects together
     */
    constructor(cacheId : string) {
        this._id = cacheId;
        // The cache DB path is in the users' home directory in a hidden folder
        this._dbPath = path.join(os.homedir(), '.kit-app-shell-cordova/cache', this._id);
    }
    /**
     * Loads the cache in memory from the disk
     * Will return the in-memory data if previously loaded
     */
    load() {
        // Cache already loaded, return the data
        if (this._cache) {
            return Promise.resolve(this._cache);
        }
        // Read the cache DB file and populate the in-memory object
        return readFile(this._dbPath, 'utf-8')
            .then(contents => JSON.parse(contents))
            // Any error up there, create a new cache
            .catch(() => ({}))
            .then((cache) => {
                this._cache = cache;
                return cache;
            });
    }
    /**
     * Dumps the in-memory data to the disk
     * If called before any load, the cache on the disk will be wiped
     */
    save() {
        const contents = JSON.stringify(this._cache);
        // Ensure the directory exists, then write
        return mkdirp(path.dirname(this._dbPath))
            .then(() => writeFile(this._dbPath, contents));
    }
    /**
     * Returns a hash of a provided config object
     */
    static configToHash(config) {
        return crypto.createHash('md5').update(JSON.stringify(config)).digest('hex');
    }
    /**
     * Loads and find a project with the same configuration
     */
    getProject(config) {
        // Always load first, if the data was loaded previously,
        // it will be returned immediately
        return this.load()
            .then((cache) => {
                const hash = ProjectCacheManager.configToHash(config);
                return cache[hash];
            });
    }
    /**
     * Add a project path to the cache
     */
    setProject(config, projectPath) {
        const hash = ProjectCacheManager.configToHash(config);
        // Load first, this is to ensure we have an up-to-date cache
        // before writing
        return this.load()
            .then(() => {
                this._cache[hash] = projectPath;
                return this.save();
            });
    }
    /**
     * Removes a project from the cache
     */
    deleteProject(config) {
        const hash = ProjectCacheManager.configToHash(config);
        return this.load()
            .then(() => {
                delete this._cache[hash];
                return this.save();
            });
    }
}
