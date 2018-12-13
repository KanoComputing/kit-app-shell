function html(strings, ...values) {
    const content = values.reduce((acc, v, idx) => `${acc}${v}${strings[idx + 1]}`, strings[0]).trim();
    const tpl = document.createElement('template');
    tpl.innerHTML = content;
    return tpl;
}

class App {
    constructor(bus, config) {
        this.root = document.createElement('div');

        const tpl = html`
            <style>
                .container {
                    display: flex;
                    flex-direction: column;
                }
            </style>
            <div class="container">
                <div id="main">Sample App 1 v${config.UI_VERSION}</div>
                <div>UI root: ${config.UI_ROOT}</div>
                <button id="click">Click me</button>
            </div>
        `;

        this.root.appendChild(tpl.content.cloneNode(true));

        const button = this.root.querySelector('#click');
        button.addEventListener('click', () => {
            document.body.style.background = 'red';
        });
    }
}

window.Shell.define(App);
