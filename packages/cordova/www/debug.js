function loadScript(src, isModule = false) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.onload = resolve;
        script.onerror = reject;
        script.src = src;
        if (isModule) {
            script.type = 'module';
        }
        document.head.appendChild(script);
    });
}

function setupUI(url) {
    const debugForm = document.querySelector('#debug');
    if (debugForm) {
        return;
    }
    const tpl = document.createElement('template');

    tpl.innerHTML = `
        <form id="debug">
            <input />
            <button>DEBUG</button>
        </form>
    `;

    const form = tpl.content.querySelector('form');
    const input = tpl.content.querySelector('input');

    input.value = url;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let UI_ROOT = input.value;
        if (input.value[input.value.length - 1] === '/') {
            UI_ROOT = `${UI_ROOT}/`;
        }
        boot(UI_ROOT);
    });

    document.body.appendChild(tpl.content);
}

function disposeUI() {
    const debugForm = document.querySelector('#debug');
    if (!debugForm) {
        return;
    }
    document.body.removeChild(debugForm);
}

function boot(url) {
    window.KitAppShellConfig.EXTERNAL_UI = true;
    window.KitAppShellConfig.UI_ROOT = url;
    loadScript('./index.js')
        .then(() => {
            localStorage.setItem('DEBUG_APP_URL', url);
            disposeUI();
        });
}

// Read previous succesfull URL
const STORED_URL = localStorage.getItem('DEBUG_APP_URL');

setupUI(STORED_URL);
