function loadScript(src) {
    var scriptEl = document.createElement('script');
    scriptEl.defer = true;
    scriptEl.src = src;
    document.getElementsByTagName('head')[0].appendChild(scriptEl);
}

if (!window.TextDecoder) {
    loadScript('./polyfills/text-encoding/encoding-indexes.js');
    loadScript('./polyfills/text-encoding/encoding.js');
}
