
class App {
    constructor(bus, config) {
        console.log(config.UI_VERSION);
        this.config = config;
    }
    get root() {
        const el = document.createElement('div');
        el.innerHTML = `
            <div>Test app running</div>
            <div>Version: ${this.config.UI_VERSION}</div>
        `;
        el.style.color = 'white';
        return el;
    }
}

window.Shell.define(App);
