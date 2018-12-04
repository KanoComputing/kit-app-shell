const platform = require('os').platform();

let autoUpdater;

module.exports = function (config) {
    if (platform === 'win32') {
        let AutoUpdaterWin32 = require('@kano/electron-updater/lib/win32');
        autoUpdater = new AutoUpdaterWin32();
    } else {
        autoUpdater = require('electron').autoUpdater;
    }
    if (platform === 'darwin') {
        autoUpdater.setFeedURL(config.darwinFeedUrl + '&v=' + config.version);
    } else {
        autoUpdater.setFeedURL(config.win32FeedUrl + '&v=' + config.version);
    }

    return autoUpdater;
};
