import { EventEmitter } from 'events';


export default class Relay extends EventEmitter {
    constructor() {
        EventEmitter.call(this);
        this.emitters = new WeakMap();
    }

    observe({ logger = arguments[0] }) {
        // Allow a module to be passed provided it exports a property named logger.
        // Otherwise assume the provided argument is the emitter itself.
        if (!(logger === this) && !this.emitters.has(logger)) {
            let handler = (...args) => {
                this.emit('log', ...args);
            };

            this.emitters.set(logger, handler);
            logger.on('log', handler);
        }
        return this;
    }

    unobserve({ logger = arguments[0] }) {
        // Allow a module to be passed provided it exports a property named logger.
        // Otherwise assume the provided argument is the emitter itself.
        if (this.emitters.has(logger)) {
            let handler = this.emitters.get(logger);
            logger.removeListener('log', handler);
            this.emitters.delete(logger);
        }
        return this;
    }

    clear() {
        this.emitters = new WeakMap();
        return this;
    }
}