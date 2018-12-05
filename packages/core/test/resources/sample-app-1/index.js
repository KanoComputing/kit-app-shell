class App {
    constructor(bus, config) {
        this.root = document.createElement('div');
        this.root.innerText = `Sample App 1 v${config.UI_VERSION}`;
    }
}

window.Shell.define(App);
