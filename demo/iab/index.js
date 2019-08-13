import { html, render } from 'lit-html/lit-html.js';

class IABFlow {
    constructor(iab, url) {
        this.iab = iab;
        this.url = url;
        this.opened = false;
        this._promise = null;
        this._messageSub = null;
    }
    open(url) {
        return new Promise((resolve, reject) => {
            this._promise = { resolve, reject };
            this.iab.openWindow(this.url || url)
                .then(() => {
                    this._messageSub = this.iab.onDidReceiveMessage(d => this.handleMessage(d));
                    this.afterOpen();
                });
        });
    }
    afterOpen() {}
    handleMessage(d) {
        if (d.m === 'quit') {
            this.handleClose();
        }
    }
    handleSuccess(data) {
        if (!this._promise) {
            return;
        }
        this._promise.resolve({
            result: data,
            userCancelled: false,
        });
        this._promise = null;
    }
    handleClose() {
        this.close()
            .then(() => {
                if (!this._promise) {
                    return;
                }
                this._promise.resolve({
                    result: null,
                    userCancelled: true,
                });
                this._promise = null;
            });
    }
    close() {
        return this.iab.close()
            .then(() => {
                this.opened = false;
            });
    }
    dispose() {
        if (this.messageSub) {
            this.messageSub.dispose();
        }
    }
}

class Auth extends IABFlow {
    signup(url) {
        return this.open(url);
    }
    handleMessage(d) {
        if (d.m === 'auth-callback') {
            this.handleSuccess(d.a);
        } else {
            super.handleMessage(d);
        }
    }
    handleSuccess(data) {
        if (!this._promise) {
            return;
        }
        this._promise.resolve(data);
        this._promise = null;
    }
}

class Sharing extends IABFlow {
    constructor(iab, url, env) {
        super(iab, `${url}?env=${env}&wait`);
    }
    afterOpen() {
        return this.iab.postMessage({ m: 'setup', a: this.opts });
    }
    share(opts) {
        this.opts = opts;
        return this.open();
    }
    handleMessage(d) {
        if (d.m === 'share-callback') {
            this.handleSuccess(d.a.success);
            this.close();
        } else {
            super.handleSuccess(d);
        }
    }
}

class App {
    constructor(context) {
        this.iab = context.iab;
        this.auth = new Auth(this.iab);
        this.sharing = new Sharing(this.iab, 'https://staging.sharing.kano.me', 'staging');
        this.root = document.createElement('div');
        this.config = context.config;

        this._render();
        window.app = this;
    }
    _render() {
        render(this.render(), this.root);
    }
    render() {
        return html`
            <h1>Welcome to the In-App Browser demo. Click on one of the following option to authenticate</h1>
            <button @click=${() => this.login()}>Login</button>
            <button @click=${() => this.signup()}>Signup</button>

            ${this.session ? html`
                <div>
                    <div>Your are authenticated as ${this.session.username}</div>
                    <div>You used the ${this.session.method} method to authenticate</div>
                </div>
                <button @click=${() => this.share()}>Click here to share</button>
            ` : ''}
            ${this.shareResult ? html`
                ${this.shareResult.userCancelled
                    ? html`<div>User cancelled sharing</div>`
                    : html`<div>Succesfully shared on Kano World. Yay!</div>`}
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
    share() {
        this.sharing.share({
            app: 'make-apps',
            userToken: this.session.token,
            hardware: [],
            attachmentKey: 'attachment',
            attachmentType: 'json',
            attachmentUrl: 'data:application/json;base64,e30=',
            coverUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAMAAAC67D+PAAAAMFBMVEX///8AAADv7+9AQEAQEBBgYGCvr69QUFDf399/f38wMDAgICC/v7/Pz8+Pj49wcHBVaELZAAAAQElEQVQImT2MWw6AMAzDkrVrGXtw/9tCYcVfViQHCAqSo/0qmnMlz5K23fhSH22kKimRSx/mfX7d8n0wLtINuAElXQD0KzV7bgAAAABJRU5ErkJggg==',
        }).then((result) => {
            this.shareResult = result;
            this._render();
        }).catch(() => {
            this.userCancelledShare = true;
            this._render();
        });
    }
    afterSuccess(session) {
        this.session = session;
        this._render();
    }
}

Shell.define(App);
