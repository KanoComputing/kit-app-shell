function loadScript(src) {
  var scriptEl = document.createElement('script');
  scriptEl.src = src;
  document.getElementsByTagName('head')[0].appendChild(scriptEl);
}

var canvas = document.createElement('canvas');
if (!canvas.toBlob) {
  console.log('loading polyfill for canvas-to-blob')
  loadScript('./polyfills/canvas-to-blob/canvas-to-blob.js');
}
