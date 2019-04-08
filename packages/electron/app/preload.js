const { ipcRenderer, remote } = require('electron');
const { ElectronIpcBusRenderer } = require('@kano/web-bus');

const config = remote.getGlobal('config');
const preload = remote.getGlobal('preload');

if (preload) {
    require(preload);
}

window.NativeBus = new ElectronIpcBusRenderer(ipcRenderer);

window.KitAppShellConfig = config;
