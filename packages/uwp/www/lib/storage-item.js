export class StorageItem {
    constructor(item) {
        this.item = item;
    }
    getContents() {
        return this.file.openReadAsync()
            .then((stream) => {
                const inputStream = stream.getInputStreamAt(0);
                var dataReader = new Windows.Storage.Streams.DataReader(inputStream);
                return dataReader.loadAsync(stream.size)
                    .then((loaded) => {
                        const text = dataReader.readString(loaded);
                        return text;
                    });
            });
    }
}
