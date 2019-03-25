import Device from './device.js';
const { BluetoothLEAdvertisementWatcherStatus, BluetoothLEAdvertisementWatcher, BluetoothLEScanningMode } = Windows.Devices.Bluetooth.Advertisement;

class BLEWatcher {
    constructor() {
        this.searches = [];
        this.devices = new Map();
        this.isScanning = false;
        this.watcher = new BluetoothLEAdvertisementWatcher();
        this.watcher.scanningMode = BluetoothLEScanningMode.active;
    }
    onPause() {
        this.stopScan();
    }
    setLogger(logger) {
        this.log = logger;
    }
    searchForDevice(testFunc, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const searchIndex = this.searches.length;
            const search = {
                test: testFunc,
                resolve,
                reject,
                to: setTimeout(() => {
                    this.searches.splice(searchIndex, 1);
                    this.stopScan();
                    reject(new Error(`Could not find device after ${timeout}ms`));
                }, timeout),
            };
            // See if the device was found before
            const found = this.matchDevices(search);
            if (found) {
                return;
            }
            // It wasn't found, add it to the searches and start scanning if it is the first search
            this.startScan()
                .catch(e => console.log('Unable to start scanning ', e));
            this.searches.push(search);
        });
    }
    matchDevices(search) {
        let matched = false;
        // Try to find a matching known device
        this.devices.forEach((device) => {
            const isMatch = search.test(device);
            if (!isMatch) {
                return;
            }
            matched = true;
            clearTimeout(search.to);
            this.stopScan();
            search.resolve(device);
        });
        return matched;
    }
    getDevices(searchFunction) {
        const returnDevices = [];
        this.devices.forEach((device) => {
            if (searchFunction(device)) {
                this.log.trace(`Discovered device: ${device.name} -> Did match`);
                returnDevices.push(device);
            } else {
                this.log.trace(`Discovered device: ${device.name} -> Not a candidate for this search`);
            }
        });
        return returnDevices;
    }
    searchForClosestDevice(testFunc, timeout = 3000) {
        return new Promise((resolve, reject) => {
            this.startScan()
                .then(() => {
                    setTimeout(() => {
                        if (this.watcher.status === BluetoothLEAdvertisementWatcherStatus.stopped) {
                            return reject(new Error('The device was paused.'));
                        }
                        let closestDevice;
                        this.log.trace('Finding closest device amongst results...');
                        this.getDevices(testFunc)
                            .forEach((device) => {
                                closestDevice = closestDevice || device;
                                this.log.trace(`RSSI Sort: ${device.name} => ${device.rssi}`);
                                if (!closestDevice || (closestDevice.rssi < device.rssi)) {
                                    closestDevice = device;
                                }
                            });
                        if (!closestDevice) {
                            return reject(new Error(`No devices have been found after ${timeout}ms.`));
                        }
                        this.stopScan();
                        return resolve(closestDevice);
                    }, timeout);
                })
                .catch((e) => {
                    this.stopScan();
                    reject(e);
                });
        });
    }
    startScan() {
        if (this.isScanning) {
            return Promise.resolve();
        }
        if (this.watcher.status === BluetoothLEAdvertisementWatcherStatus.started) {
            return Promise.resolve();
        }

        this.scanResultCallback = (e) => {
            const results = e.detail;
            results.forEach((result) => {
                const device = new Device(result, this);
                const previousDevice = this.devices.get(device.address);
                if (previousDevice) {
                    previousDevice.rssi = device.rssi;
                } else {
                    this.devices.set(device.address, device);
                }

                this.searches.forEach((search, index) => {
                    const isMatch = search.test(device);
                    if (!isMatch) {
                        this.log.trace(`Discovered device: ${device.name} -> Not a candidate for this search`);
                        return;
                    }
                    this.log.trace(`Discovered device: ${device.name} -> Did match`);
                    clearTimeout(search.to);
                    this.searches.splice(index, 1);
                    this.stopScan();
                    search.resolve(this.devices.get(device.address));
                });
            });
        };

        this.watcher.addEventListener('received', this.scanResultCallback);
    
        this.watcher.start();
        this.isScanning = true;
        return Promise.resolve();
    }
    stopScan() {
        if (!this.isScanning) {
            return Promise.resolve();
        }
        if (this.watcher.status === BluetoothLEAdvertisementWatcherStatus.started) {
            this.watcher.stop();
        }
        if (this.scanResultCallback) {
            this.watcher.removeEventListener('received', this.scanResultCallback);
        }

        this.isScanning = false;

        // Remove all the search queries.
        while (this.searches.length) {
            clearTimeout(this.searches[0].to);
            this.searches[0].reject(new Error('The device stopped scanning.'));
            this.searches.splice(0, 1);
        }
    }
    deleteCachedDevice(deviceAddress) {
        this.devices.delete(deviceAddress);
    }
}

export default BLEWatcher;