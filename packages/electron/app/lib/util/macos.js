const os = require('os');
const { app, dialog } = require('electron');

function moveToApplicationsFolderIfNecessary(window, force = false) {
    if (!force && (os.platform() !== 'darwin' || !app.isPackaged)) {
        return;
    }
    if (!app.isInApplicationsFolder()) {
        setTimeout(() => {
            const button = dialog.showMessageBox(window, {
                type: 'question',
                buttons: ['Move now', 'No, thank you'],
                defaultId: 0,
                cancelId: 1,
                title: 'Move to the Applications folder',
                message: 'Looks like this app is not in the Applications folder. Updates might not work until you move it.',
            });
            if (button === 0) {
                app.moveToApplicationsFolder();
            }
        }, 1000);
    }
}

module.exports = {
    moveToApplicationsFolderIfNecessary,
}