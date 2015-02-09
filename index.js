import caller from 'caller';
import Thing from 'core-util-is';
import Publisher from './lib/publisher';
import Logger from './lib/logger';


const PROP = 'publisher';
const PUBLISHER = new Publisher();

export default {

    decorate(parent) {
        if (Thing.isPrimitive(parent.exports)) {
            // noop
            return;
        }

        if (parent.exports && !Thing.isUndefined(parent.exports[PROP])) {
            throw new Error('Module already exports property `publisher`.');
        }

        Object.defineProperty(parent.exports, PROP, {
            value: this.getPublisher()
        });

        // Fail if someone accidentally...
        // <code>
        //     Dbrickashaw.decorate(module);
        //
        //     /* ... sometime later */
        //
        //     module.exports = { /* ... */ };
        // </code>
        setImmediate(() => {
            if (!(PROP in parent.exports) || parent.exports[PROP] !== this.getPublisher()) {
                throw new Error('Publisher export overwritten.');
            }
        });
    },

    getPublisher() {
        return PUBLISHER;
    },

    createLogger(name = caller()) {
        let logger = new Logger(name);
        this.getPublisher().observe(logger);
        return logger;
    }

};
