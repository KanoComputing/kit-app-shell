import * as fs from 'fs';
import * as et from 'elementtree';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Manipulates a AppXManifest.xml file to update common properties
 */
export class AppXManifest {
    private manifestPath : string;
    private doc : et.Element;
    private root : et.Element;
    /**
     * @param manifestPath Path to the AppXManifest.xml file
     */
    constructor(manifestPath : string) {
        this.manifestPath = manifestPath;
    }
    open() : Promise<void> {
        if (this.root) {
            return Promise.resolve();
        }
        return readFile(this.manifestPath, 'utf-8')
            .then((manifestString : string) => {
                this.doc = et.parse(manifestString);
                this.root = this.doc.getroot();
            });
    }
    /**
     * Update or create a logo entry in the manifest
     * @param app PackageName of the app
     * @param key Logo key.
     * See https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-uap-visualelements
     * @param value Path to the logo
     */
    setLogo(app : string, key : string, value : string) : void {
        const query = `./Applications/Application/[@Id="${app}"]/uap:VisualElements`;
        const visualElements : et.Element = this.root.find(query);
        visualElements.attrib[key] = value;
    }
    setDefaultTile(app : string, key : string, value : string) : void {
        const query = `./Applications/Application/[@Id="${app}"]/uap:VisualElements/uap:DefaultTile`;
        const visualElements : et.Element = this.root.find(query);
        visualElements.attrib[key] = value;
    }
    setCapabilities(caps : string[]) : void {
        const el : et.Element = this.root.find('./Capabilities');
        el.clear();
        caps.forEach((capString) => {
            const cap = new et.Element('rescap:Capability');
            cap.attrib.Name = capString;
            el.append(cap);
        });
    }
    setMainLogo(logo : string) : void {
        const el = this.root.find('./Properties/Logo');
        el.text = logo;
    }
    toString() : string {
        return this.doc.write({ indent: 4 });
    }
    write() : Promise<void> {
        return writeFile(this.manifestPath, this.doc.write({ indent: 4 }));
    }
}
