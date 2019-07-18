// At this point, we used requirejs to load our shell, but as we run, we don't need it anymore
// This will make sure modules using a UMD approach don't think requirejs can be used
window.define = null;
const script = document.createElement('script');
script.type = 'module';
script.src = '/www/index.js';
document.body.appendChild(script);
