import Fs from 'fs';
import Path from 'path';
import caller from 'caller';
import debuglog from 'debuglog';
import { EventEmitter } from 'events';


const LEVELS = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];

export default class Dbrickashaw extends EventEmitter {

    constructor(name = caller()) {
        EventEmitter.call(this);

        if (Common.isAbsolutePath(name)) {
            let root = Common.findModuleRoot(name);
            name = Path.relative(root, name);
        }

        this.name = name;
        this.debuglog = debuglog(name);
        this.on('log', ({ ts, tags, message }) => {
            message = typeof message === 'string' ? message : JSON.stringify(message);
            this.debuglog('%d\t%s\t%s', ts, tags.join(','), message);
        });

        for (let level of LEVELS) {
            this[level] = function (tags, ...rest) {
                tags = Array.isArray(tags) ? tags : [ tags ];
                this.log([level, ...tags], ...rest);
            }
        }

        Dbrickashaw.getRelay().register(this);
    }

    static getRelay() {
        return Dbrickashaw.RELAY || (Dbrickashaw.RELAY = Relay.create());
    }

    static createLogger(name = caller()) {
        return new Dbrickashaw(name);
    }

    log(tags, data) {
        this.emit('log', {
            source: this.name,
            ts: Date.now(),
            tags: Array.isArray(tags) ? tags : [ tags ],
            data
        });
    }

}


export class Relay extends EventEmitter {
    constructor() {
        EventEmitter.call(this);
        this.emitters = new WeakMap();
    }

    static create() {
        return new Relay();
    }

    register({ logger = arguments[0] }) {
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

    unregister({ logger = arguments[0] }) {
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


export class Common {

    static isAbsolutePath(path) {
        path = Path.normalize(path);
        return path === Path.resolve(path);
    }

    static findModuleRoot(dir) {
        let root = Common.findFile(dir, 'package.json');
        return Path.dirname(root);
    }

    static findFile(dir, file) {
        let path = Path.join(dir, file);
        if (Fs.existsSync(path)) {
            return path;
        }

        let parent = Path.dirname(dir);
        if (parent === dir || parent === '/') {
            return undefined;
        }

        return Common.findFile(parent, file);
    }

}