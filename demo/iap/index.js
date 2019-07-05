import { IAPManager } from '@kano/web-bus/esm/apis/iap/index.js';
import { html, render } from 'lit-html/lit-html.js';

class IAPApp {
    constructor(bus, config) {
        console.log(config);
        this.iap = new IAPManager(bus);

        this.root = document.createElement('div');
        this.render();
    }

    render() {
        return html`
            <h1>Hello</h1>
        `;
    }

    _render() {
        render(this.render(), this.root);
    }
}

Shell.define(IAPApp);
