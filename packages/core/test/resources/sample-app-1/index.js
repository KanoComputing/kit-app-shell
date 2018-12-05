class App {
    constructor() {
        this.root = document.createElement('div');
        this.root.innerText = 'Sample App 1';
    }
}

window.Shell.define(App);
