const os = require('os');
const { getKanoOSInfo } = require('./util/kano-os');

/* eslint global-require: 0 */
function getPlatformData() {
    const config = {};

    const kanoOSInfo = getKanoOSInfo();

    if (kanoOSInfo) {
        config.OS_PLATFORM = kanoOSInfo.platform;
        config.OS_VERSION = kanoOSInfo.release;
    } else {
        config.OS_PLATFORM = os.platform();
        config.OS_VERSION = os.release();
    }

    return config;
}

module.exports = getPlatformData;
