import Config = require('cordova-config');
import * as et from 'elementtree';

export class CordovaConfig extends Config {
    private absoluteRoot : et.Element;
    private root : et.Element;
    private doc : et.Element;
    selectPlatform(name : string) : void {
        this.absoluteRoot = this.root;
        this.root = this.root.find(`./platform/[@name="${name}"]`);
    }
    selectRoot() : void {
        this.root = this.absoluteRoot || this.root;
        this.absoluteRoot = this.root;
    }
    removeAll(query : string) : void {
        this.doc.findall(`./${query}`).forEach((tag) => this.root.remove(tag));
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
        this.root.append(el);

        if (typeof content === 'object') {
            el.append(content);
        } else {
            el.text = content || '';
        }

        el.attrib = {};
        el.attrib = Object.assign({}, attribs);
    }
    setWidgetAttribute(name : string, value : string) : void {
        this.root.attrib[name] = value;
    }
    addEditConfig(file : string, target : string, mode : string, contents : string) {
        this.addElement('edit-config', et.XML(contents), { file, mode, target });
    }
}
