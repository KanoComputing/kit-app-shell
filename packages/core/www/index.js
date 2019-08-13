import { IAB } from './iab.js';

export class Context {
    constructor(bus, config) {
        this.bus = bus;
        this.config = config;

        this.iab = new IAB(bus);
    }
}
