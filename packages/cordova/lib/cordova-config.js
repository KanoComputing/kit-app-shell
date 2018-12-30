const Config = require('cordova-config');
const et = require('elementtree');

class CordovaConfig extends Config {
    selectPlatform(name) {
        this._root = this._root.find(`./platform/[@name="${name}"]`);
    }
    removeAll(query) {
        this._doc.findall(`./${query}`).forEach(tag => this._root.remove(tag));
    }
    removeIcons() {
        this.removeAll('icon');
    }
    removeScreens() {
        this.removeAll('splash');
    }
    addIcon(attrs = {}) {
        return this.addElement('icon', '', attrs);
    }
    addScreen(attrs = {}) {
        return this.addElement('splash', '', attrs);
    }
    addAllowNavigation(href) {
        return this.addElement('allow-navigation', '', { href });
    }
    addElement(tagName, content, attribs = {}) {
        const el = new et.Element(tagName);
        this._root.append(el);
        
        el.text = content || '';
        el.attrib = {};
        el.attrib = Object.assign({}, attribs);
    }
}

module.exports = CordovaConfig;