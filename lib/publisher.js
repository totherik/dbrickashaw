import { EventEmitter } from 'events';


const EVENT = 'log';

export default class Publisher extends EventEmitter {
    constructor(predicate = () => true) {
        super();
        // Should be WeakMap, but currently in 6to5
        // WeakMaps are not actual WeakMaps and
        // also not iterable.
        this.emitters = new Map();
        this.predicate = predicate;
    }

    observe({ publisher = arguments[0] }) {
        // Allow a module to be passed provided it exports a property named publisher.
        // Otherwise assume the provided argument is the emitter itself.
        if (!(publisher === this) && !this.emitters.has(publisher)) {
            let handler = (...args) => {
                if (this.predicate(...args)) {
                    this.emit(EVENT, ...args);
                }
            };

            this.emitters.set(publisher, handler);
            publisher.on(EVENT, handler);
        }
        return this;
    }

    unobserve({ publisher = arguments[0] }) {
        // Allow a module to be passed provided it exports a property named publisher.
        // Otherwise assume the provided argument is the emitter itself.
        if (this.emitters.has(publisher)) {
            let handler = this.emitters.get(publisher);
            publisher.removeListener(EVENT, handler);
            this.emitters.delete(publisher);
        }
        return this;
    }

    filter(predicate) {
        if (typeof predicate === 'function') {
            return new Publisher(predicate).observe(this);
        }
        return this;
    }

    clear() {
        for (let [ emitter, handler ] of this.emitters) {
            emitter.removeListener(EVENT, handler);
        }
        this.emitters = new Map();
        return this;
    }
}
