import Config = require('cordova-config');
import * as et from 'elementtree';

export class CordovaConfig extends Config {
    _absoluteRoot : et.Element;
    _root : et.Element;
    _doc : et.Element;
    selectPlatform(name : string) : void {
        this._absoluteRoot = this._root;
        this._root = this._root.find(`./platform/[@name="${name}"]`);
    }
    selectRoot() : void {
        this._root = this._absoluteRoot || this._root;
        this._absoluteRoot = this._root;
    }
    removeAll(query : string) : void {
        this._doc.findall(`./${query}`).forEach(tag => this._root.remove(tag));
    }
    removeIcons() : void {
        this.removeAll('icon');
    }
    removeScreens() : void {
        this.removeAll('splash');
    }
    addIcon(attrs : object = {}) : void {
        return this.addElement('icon', '', attrs);
    }
    addScreen(attrs : object = {}) : void {
        return this.addElement('splash', '', attrs);
    }
    addAllowNavigation(href : string) : void {
        return this.addElement('allow-navigation', '', { href });
    }
    addElement(tagName : string, content : string, attribs : object = {}) : void {
        const el = new et.Element(tagName);
        this._root.append(el);

        if (typeof content === 'object') {
            el.append(content);
        } else {
            el.text = content || '';
        }

        el.attrib = {};
        el.attrib = Object.assign({}, attribs);
    }
    setWidgetAttribute(name : string, value : string) : void {
        this._root.attrib[name] = value;
    }
    addEditConfig(file : string, target : string, mode : string, contents : string) {
        this.addElement('edit-config', et.XML(contents), { file, mode, target });
    }
}
