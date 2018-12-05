export class LogWriter {
    constructor(fileName) {
        this._fileName = fileName;
    }
    init() {
        return this._open()
            .then((dirEntry) => this._createFile(dirEntry))
            .then((fileEntry) => {
                this._fileEntry = fileEntry;
            });
    }
    _open() {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, resolve, reject);
        });
    }
    _createFile(dirEntry) {
        return new Promise((resolve, reject) => {
            dirEntry.getFile(fileName, { create: true, exclusive: false }, resolve, reject);
        });
    }
    _write(chunk) {
        return new Promise((resolve, reject) => {
            this._fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = resolve;
                fileWriter.onerror = reject;
                fileWriter.write(new Blob([chunk], { type: 'text/plain' }));
            });
        });
    }
}

export default LogWriter;
