import { EventEmitter } from '@kano/common/index.js';
import { StorageItem } from './storage-item.js';

export class ShareTargetManager {
    constructor() {
        this._onDidRequestShare = new EventEmitter();
    }
    onLaunched(args) {
        const { ActivationKind } = Windows.ApplicationModel.Activation;
        const { StandardDataFormats } = Windows.ApplicationModel.DataTransfer;
        if (args.kind !== ActivationKind.shareTarget) {
            return;
        }
        const { data } = args.shareOperation
        if (!data.contains(StandardDataFormats.storageItems)) {
            return;
        }
        data.getStorageItemsAsync()
            .done((items) => {
                const [item] = items;
                const file = new StorageItem(item);
                return file.getContents()
                    .then((text) => {
                        this.onDidRequestShare.fire({
                            file: text,
                            title: data.properties.title,
                            description: data.properties.description,
                        });
                    });
            });
    }
    get onDidRequestShare() { return this._onDidRequestShare.event; }
}
