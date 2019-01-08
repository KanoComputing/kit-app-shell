"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config = require("cordova-config");
const et = require("elementtree");
class CordovaConfig extends Config {
    selectPlatform(name) {
        this._absoluteRoot = this._root;
        this._root = this._root.find(`./platform/[@name="${name}"]`);
    }
    selectRoot() {
        this._root = this._absoluteRoot || this._root;
        this._absoluteRoot = this._root;
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
        if (typeof content === 'object') {
            el.append(content);
        }
        else {
            el.text = content || '';
        }
        el.attrib = {};
        el.attrib = Object.assign({}, attribs);
    }
    setWidgetAttribute(name, value) {
        this._root.attrib[name] = value;
    }
    addEditConfig(file, target, mode, contents) {
        this.addElement('edit-config', et.XML(contents), { file, mode, target });
    }
}
exports.CordovaConfig = CordovaConfig;
//# sourceMappingURL=cordova-config.js.map