import EventEmitter from '../../lib/event-emitter.js';
const { Bluetooth } = Windows.Devices;
const {
    BluetoothLEDevice,
    BluetoothConnectionStatus,
    BluetoothCacheMode,
    GenericAttributeProfile,
} = Bluetooth;
const { GattCharacteristicProperties, GattClientCharacteristicConfigurationDescriptorValue } = GenericAttributeProfile;

function toBuffer(b) {
	// TODO: Use nodert-streams to more efficiently convert the buffer?
	let len = b.length;
	const DataReader = Windows.Storage.Streams.DataReader;
	let r = DataReader.fromBuffer(b);
	let a = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		a[i] = r.readByte();
	}
	return a;
}

function fromBuffer(b) {
	// TODO: Use nodert-streams to more efficiently convert the buffer?
	let len = b.length;
	const DataWriter = Windows.Storage.Streams.DataWriter;
	let w = new DataWriter();
	for (let i = 0; i < len; i++) {
		w.writeByte(b[i]);
	}
	return w.detachBuffer();
}

class Characteristic {
    constructor(result, service) {
        this._char = result;
        this.uuid = result.uuid.toUpperCase();
        this.service = service;
        this.subscriptions = [];
    }
    subscribe(callback) {
        this.subscriptions.push(callback);
        if (this.subscriptions.length === 1) {
            return this._subscribe();
        }
        return Promise.resolve();
    }
    _subscribe() {
        return new Promise((resolve, reject) => {
            const descriptorValue = this._char.characteristicProperties & GattCharacteristicProperties.indicate
                    ? GattClientCharacteristicConfigurationDescriptorValue.indicate
                    : GattClientCharacteristicConfigurationDescriptorValue.notify;
            this._char.addEventListener('valuechanged', (e) => {
                const data = toBuffer(e.characteristicValue);
                this.subscriptions.forEach((callback) => {
                    callback(data);
                });
            });
            this._char.writeClientCharacteristicConfigurationDescriptorWithResultAsync(descriptorValue)
                .then(() => resolve(), (e) => reject(e));
        });
    }
    unsubscribe(callback) {
        const index = this.subscriptions.indexOf(callback);
        this.subscriptions.splice(index, 1);
        if (this.subscriptions.length === 0) {
            return this._unsubscribe();
        }
        return Promise.resolve();
    }
    _unsubscribe() {
        return Promise.resolve();
    }
    read() {
        return new Promise((resolve, reject) => {
            this._char.readValueAsync()
                .then((result) => {
                    resolve(toBuffer(result.value));
                }, (e) => reject(e));
        });
    }
    write(value) {
        const bytes = new Uint8Array(value);
        const data = fromBuffer(bytes);

        return new Promise((resolve, reject) => {
            this._char.writeValueWithResultAsync(data)
                .then((result) => {
                    const value = result.value ? toBuffer(result.value) : null;
                    resolve(value);
                }, (e) => reject(e))
        });
    }
}

class Service {
    constructor(uuid, characteristics, device) {
        this.uuid = uuid;
        this.characteristics = new Map();
        characteristics.forEach(cData =>
            this.characteristics.set(cData.uuid.toUpperCase(), new Characteristic(cData, this)));
        this.device = device;
    }
}

class Device extends EventEmitter {
    constructor(result, manager) {
        super();
        this._onConnectionStatusChanged = this._onConnectionStatusChanged.bind(this);
        this._address = result.bluetoothAddress;
        this.address = Device.formatBluetoothAddress(result.bluetoothAddress);
        this.name = result.advertisement.localName;
        this.rssi = result.rawSignalStrengthInDBm;
        this.services = new Map();
        this.manager = manager;
        this.discovered = false;
    }
    connect(timeout = 5000) {
        return this.isConnected()
            .then((isConnected) => {
                if (isConnected) {
                    return Promise.resolve();
                }
                return this._connect(timeout);
            });
    }
    _cleanup() {
        // Clear services cache on disconnect
        this.services = new Map();
        this.discovered = false;
        this.close()
            .then(() => {
                this.emit('disconnect');
            });
    }
    _connect(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const to = setTimeout(() => {
                this._cleanup();
                reject(new Error('Unable to connect in ${timeout}ms.'));
            }, timeout);

            BluetoothLEDevice.fromBluetoothAddressAsync(this._address)
                .then((uwpDevice) => {
                    clearTimeout(to);
                    this._uwpDevice = uwpDevice;
                    this._uwpDevice.addEventListener('connectionstatusshanged', this._onConnectionStatusChanged);
                    resolve();
                }, (e) => {
                    clearTimeout(to);
                    this._cleanup();
                });
        });
    }
    _onConnectionStatusChanged(e) {
        if (e.connectionStatus === BluetoothConnectionStatus.disconnected) {
			this.emit('disconnect');
		}
    }
    isConnected() {
        if (!this._uwpDevice) {
            return Promise.resolve(false);
        }
        return Promise.resolve(this._uwpDevice.connectionStatus === BluetoothConnectionStatus.connected)
    }
    discover() {
        if (this.discovered) {
            return Promise.resolve(this.services);
        }
        return new Promise((resolve, reject) => {
            this.discovered = true;
            this._uwpDevice.getGattServicesAsync(BluetoothCacheMode.uncached)
                .then((result) => {
                    const tasks = result.services.map((service) => {
                        return new Promise((resolve, reject) => {
                            service.getCharacteristicsAsync(BluetoothCacheMode.uncached)
                                .then((result) => {
                                    resolve({ uuid: service.uuid.toUpperCase(), chars: result.characteristics });
                                }, (e) => reject(e))
                        });
                    });
                    Promise.all(tasks)
                            .then((servicesData) => {
                                servicesData.forEach((serviceData) => {
                                    this.services.set(serviceData.uuid, new Service(
                                        serviceData.uuid,
                                        serviceData.chars,
                                        this,
                                    ));
                                });
                                resolve(this.services);
                            }).catch((e) => reject(e));
                }, (e) => reject(e));
        });
    }
    close() {
        this._uwpDevice.removeEventListener('connectionstatusshanged', this._onConnectionStatusChanged);
        this._uwpDevice.close();
        return Promise.resolve();
    }
    disconnect() {
        this.close();
    }
    static formatBluetoothAddress(address) {
        if (!address) {
            return null;
        }
    
        let formattedAddress = address.toString(16);
        while (formattedAddress.length < 12) {
            formattedAddress = '0' + formattedAddress;
        }
        formattedAddress =
            formattedAddress.substr(0, 2) + ':' +
            formattedAddress.substr(2, 2) + ':' +
            formattedAddress.substr(4, 2) + ':' +
            formattedAddress.substr(6, 2) + ':' +
            formattedAddress.substr(8, 2) + ':' +
            formattedAddress.substr(10, 2);
        return formattedAddress;
    }
}

export default Device;
