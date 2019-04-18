import { ChannelServer, UpdaterChannelId, UpdaterMethod } from '@kano/web-bus/esm/index.js'

export class UpdaterServer extends ChannelServer {
    constructor(bus) {
        super(bus, UpdaterChannelId);

        const { StorePackageUpdateState, StoreContext } = Windows.Services.Store;

        this.listen(UpdaterMethod.SETUP, () => {
            this.context = StoreContext.getDefault();
            return Promise.resolve(true);
        });
        this.listen(UpdaterMethod.CHECK_FOR_UPDATES, () => {
            return this.context.getAppAndOptionalStorePackageUpdatesAsync()
                .then((updates) => {
                    if (!updates.length || !this.context.canSilentlyDownloadStorePackageUpdates) {
                        this.emit(UpdaterMethod.UPDATE_NOT_AVAILABLE_EVENT);
                        return;
                    }
                    this.updates = updates;
                    this.emit(UpdaterMethod.UPDATE_AVAILABLE_EVENT);
                    return this.context.trySilentDownloadStorePackageUpdatesAsync(updates)
                        .then((downloadResult) => {
                            switch (downloadResult.overallState) {
                                case StorePackageUpdateState.completed:
                                    this.emit(UpdaterMethod.UPDATE_DOWNLOADED_EVENT, {});
                                    break;
                                case StorePackageUpdateState.canceled:
                                case StorePackageUpdateState.errorLowBattery:
                                case StorePackageUpdateState.errorWiFiRecommended:
                                case StorePackageUpdateState.errorWiFiRequired:
                                case StorePackageUpdateState.otherError:
                                    this.emit(UpdaterMethod.UPDATE_NOT_AVAILABLE_EVENT);
                                    return;
                                default:
                                    break;
                            }
                        });
                });
        });
        this.listen(UpdaterMethod.QUIT_AND_INSTALL, () => {
            return this.context.trySilentDownloadAndInstallStorePackageUpdatesAsync(this.updates)
                .then((downloadResult) => {
                    switch (downloadResult.overallState) {
                        case StorePackageUpdateState.canceled:
                        case StorePackageUpdateState.errorLowBattery:
                        case StorePackageUpdateState.otherError:
                            throw new Error('Could not install update: Download failed from the store');
                        default:
                            break;
                    }
                });
        });
    }
}
