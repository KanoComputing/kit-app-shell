const { ipcRenderer } = require('electron');

function createIAB(src) {
    const w = document.createElement('iframe');
    w.style.width = '100vw';
    w.style.height = '100vh';
    w.style.top = '0';
    w.style.left = '0';
    w.style.border = '0';
    w.style.position = 'absolute';
    w.style.transition = 'opacity 333ms linear';
    w.style.opacity = 0;
    document.body.appendChild(w);
    w.setAttribute('src', src);
    window.addEventListener('message', (e) => {
        ipcRenderer.send('iab-message', e.data);
    });
    window.iabIFrame = w;
    w.addEventListener('load', () => {
        w.style.opacity = 1;
        ipcRenderer.send('iab-load');
    });
}

function removeIAB() {
    if (window.iabIFrame) {
        window.iabIFrame.remove();
        window.iabIFrame = null;
    }
}

ipcRenderer.on('open-iab', (e, src) => {
    createIAB(src);
});

ipcRenderer.on('close-iab', () => {
    removeIAB();
});

ipcRenderer.on('iab-message', (e, args) => {
    if (!window.iabIFrame) {
        return;
    }
    window.iabIFrame.contentWindow.postMessage(args, '*');
});
