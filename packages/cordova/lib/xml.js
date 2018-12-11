const et = require('elementtree');
/**
 * TODO: Rethink this whole thing. Maybe find a more solid XML manipulation API
 */


/**
 * Find an element using a query and update/create that element with the provided data
 */
function setElement(root, tag, tagName, content, attribs = {}) {
    // Query from the root
    let el = root.find(`./${tag}`);
    // No element found, create a new one
    if (!el) {
        el = new et.Element(tagName);
        // Add to root
        root.append(el);
    }
    // Set the content of the element or leave it empty
    el.text = content || '';

    // Set the attributes to a copy of the provided attributes
    el.attrib = Object.assign({}, attribs);
}

/**
 * Adds an element to a provided element
 */
function addElement(root, tagName, content, attribs = {}) {
    const el = new et.Element(tagName);
    root.append(el);
    
    el.text = content || '';

    el.attrib = {};

    el.attrib = Object.assign({}, attribs);
}

/**
 * Add a subtree to a node using an XML stirng
 */
function addRaw(root, string) {
    const node = new et.XML(string);

    root.append(node);
}

/**
 * Find an element in a provided cordova-config instance
 */
function findInConfig(cfg, query) {
    return cfg._doc.find(`./${query}`);
}

module.exports = {
    setElement,
    findInConfig,
    addElement,
    addRaw,
};