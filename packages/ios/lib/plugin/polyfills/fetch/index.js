function loadScript(src) {
    var scriptEl = document.createElement('script');
    scriptEl.src = src;
    document.getElementsByTagName('head')[0].appendChild(scriptEl);
}

if (!window.fetch) {
    loadScript('./polyfills/fetch/fetch.js');
}
