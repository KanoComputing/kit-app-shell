const et = require('elementtree');

function setElement(root, tag, tagName, content, attribs = {}) {
    let el = root.find(`./${tag}`);
    if (!el) {
        el = new et.Element(tagName);
        root.append(el);
    }
    el.text = content || '';

    el.attrib = {};

    Object.keys(attribs).forEach(function (key) {
        el.set(key, attribs[key]);
    });
}

function addElement(root, tagName, content, attribs = {}) {
    const el = new et.Element(tagName);
    root.append(el);
    
    el.text = content || '';

    el.attrib = {};

    Object.keys(attribs).forEach(function (key) {
        el.set(key, attribs[key]);
    });
}

function findInConfig(cfg, query) {
    return cfg._doc.find(`./${query}`);
}

module.exports = {
    setElement,
    findInConfig,
    addElement,
};