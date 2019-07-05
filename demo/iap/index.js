import { IAPManager } from '@kano/web-bus/esm/apis/iap/index.js';
import { html, render } from 'lit-html/lit-html.js';

class IAPApp {
    constructor(bus, config) {
        this.products = [];
        this.transactions = [];
        this.iap = new IAPManager(bus);

        this.iap.registerProduct('5_gold', {
            type: this.iap.ProductTypes.CONSUMABLE,
            appStore: '5_gold',
        });
        this.iap.registerProduct('ch_pack_1', {
            type: this.iap.ProductTypes.NON_CONSUMABLE,
            appStore: 'ch_pack_1',
        });

        this.root = document.createElement('div');
        this._render();

        this.iap.restore()
            .then((t) => {
                this.transactions = t;
            });

        this.iap.getProducts(['5_gold', 'ch_pack_1'])
            .then((ps) => {
                this.products = ps;
                this._render();
            });
        window.app = this;
    }

    buy(p) {
        p.buy()
            .then((f)=> {
                console.log(f);
            });
    }

    wasPurchased(ids, id) {
        return ids.indexOf(id) !== -1;
    }

    renderProducts() {
        const purchased = this.transactions.map(t => t.productId);
        return html`
            <div>
                ${this.products.map(p => html`
                    <div>
                        <div>${p.data.title}</div>
                        <div>${p.data.description}</div>
                        <div>${p.data.price}</div>
                        <button @click=${() => this.buy(p)} ?disabled=${this.wasPurchased(purchased, p.data.id)}>${this.wasPurchased(purchased, p.data.id) ? 'Got it' : 'Buy Now!'}</button>
                    <div>
                `)}
            </div>
        `;
    }

    render() {
        return html`
            <h1>Hello, Welcome to my shop. Please buy something</h1>
            ${this.renderProducts()}
        `;
    }

    _render() {
        render(this.render(), this.root);
    }
}

Shell.define(IAPApp);
