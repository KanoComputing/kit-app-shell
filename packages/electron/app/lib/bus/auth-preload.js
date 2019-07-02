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
        switch(e.data.m) {
            case 'auth-callback':
                ipcRenderer.send('auth-token-callback', e.data.a);
                break;
            case 'quit':
                ipcRenderer.send('quit');
                break;
        }
    });
    window.iabIFrame = w;
    w.addEventListener('load', () => {
        w.style.opacity = 1;
    });
}

function removeIAB() {
    if (window.iabIFrame) {
        window.iabIFrame.remove();
    }
}

ipcRenderer.on('open-iab', (e, src) => {
    createIAB(src);
});

ipcRenderer.on('close-iab', () => {
    removeIAB();
});

