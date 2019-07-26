import { Channel } from '@kano/web-bus/esm/bus.js';

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
        const auth = new Auth(bus);

        this.root = document.createElement('div');

        this.root.innerHTML = `
            <button>Signup</button>
        `;

        this.button = this.root.querySelector('button');
        this.button.addEventListener('click', () => {
            auth.signup('https://app.auth.kano.me?env=staging');
        });
    }
}

Shell.define(App);
