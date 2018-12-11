const s = document.createElement('script');
s.src = `${LR_URL}/livereload.js?snipver=1`;
document.body.appendChild(s);

fetch(`${TUNNEL_URL}/_config`)
    .then(r => r.json())
    .then((config) => {
        Object.assign(window.KitAppShellConfig, config, { UI_ROOT: TUNNEL_URL });
        return import(`${TUNNEL_URL}/index.js`);
    });

