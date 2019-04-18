export function getVersion() {
    if (!('Windows' in window)) {
        return '';
    }
    var current = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamilyVersion;
    var currentUlong = parseInt(current).toString(16),
        bit00 = parseInt(currentUlong.slice(currentUlong.length - 4), 16),
        bit16 = parseInt(currentUlong.slice(currentUlong.length - 8, currentUlong.length - 4), 16),
        bit32 = parseInt(currentUlong.slice(currentUlong.length - 12, currentUlong.length - 8), 16),
        bit48 = parseInt(currentUlong.slice(0, currentUlong.length - 12), 16);
    return [bit48, bit32, bit16, bit00].join(".");
}