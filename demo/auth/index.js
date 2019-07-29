import { Channel } from '@kano/web-bus/esm/bus.js';
import { html, render } from 'lit-html/lit-html.js';

class Auth {
    constructor(bus) {
        this.channel = new Channel(bus, 2345);
    }

    signup(src) {
        return this.channel.sendRequest(0, 60 * 60 * 1000, src);
    }
}

class App {
    constructor(bus, config) {
        this.auth = new Auth(bus);
        this.root = document.createElement('div');

        this._render();
    }
    _render() {
        render(this.render(), this.root);
    }
    render() {
        return html`
            <h1>Welcome to the auth demo. Click on one of the following option to authenticate</h1>
            <button @click=${() => this.login()}>Login</button>
            <button @click=${() => this.signup()}>Signup</button>

            ${this.session ? html`
                <div>
                    <div>Your are authenticated as ${this.session.username}</div>
                    <div>You used the ${this.session.method} method to authenticate</div>
                </div>
            ` : ''}

        `;
    }
    login() {
        this.auth.signup('https://app.auth.kano.me?env=staging#login')
            .then((s) => this.afterSuccess(s));
    }
    signup() {
        this.auth.signup('https://app.auth.kano.me?env=staging#signup')
            .then((s) => this.afterSuccess(s))
    }
    afterSuccess(session) {
        this.session = session;
        this._render();
    }
}

Shell.define(App);
