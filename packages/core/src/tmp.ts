import * as path from 'path';
import * as os from 'os';
import * as getFolderSizeCb from 'get-folder-size';
import * as rimrafCb from 'rimraf';
import { promisify } from 'util';

const getFolderSize = promisify(getFolderSizeCb);
const rimraf = promisify(rimrafCb);

const ROOT = 'kash';

const tmpdir = process.env.KASH_TMP_DIR ? path.resolve(process.env.KASH_TMP_DIR) : os.tmpdir();

enum TmpType {
    Build = 'build',
    Cache = 'cache',
}

export function getTmpDir() : string {
    return tmpdir;
}

export function getRootPath() : string {
    return path.join(tmpdir, ROOT);
}

export function getBuildPath() : string {
    return path.join(getRootPath(), TmpType.Build);
}

export function getCachePath() : string {
    return path.join(getRootPath(), TmpType.Cache);
}

interface ITmpTypeStatus {
    size : number;
}

export function getDirStatus(tmpType : TmpType) : Promise<ITmpTypeStatus> {
    const tmpPath = path.join(getRootPath(), tmpType);
    return getFolderSize(tmpPath)
        .then((size : number) => {
            return { size } as ITmpTypeStatus;
        })
        .catch((e) => {
            if (e.code === 'ENOENT') {
                return { size: 0 } as ITmpTypeStatus;
            }
            throw e;
        });
}

interface ITmpStatus {
    [K : string] : ITmpTypeStatus;
}

export function status() : Promise<ITmpStatus> {
    const result = {} as ITmpStatus;
    const tasks = Object.keys(TmpType).map((key) => {
        return getDirStatus(TmpType[key])
            .then((tmpStatus) => {
                result[TmpType[key]] = tmpStatus;
            });
    });
    return Promise.all(tasks)
        .then(() => result);
}

export function clear() : Promise<void> {
    return rimraf(getRootPath());
}
