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
            // Derive a logger name from module name and path relative to module root.
            // e.g. "dbrickashaw:index.js" If a name can't be derived, default to
            // absolute path to file.
            let pkg = Common.findFile(name, 'package.json');
            if (pkg) {
                let root = Path.dirname(pkg);
                name = Path.relative(root, name);
                name = require(pkg).name + ':' + name;
            }
        }

        this.name = name;
        this.debuglog = debuglog(name);

        // register debuglog as a default log handler. Is opt-in by default,
        // so is a noop unless NODE_DEBUG is enabled for a particular name.
        this.on('log', ({ ts, tags, data }) => {
            data = typeof data === 'string' ? data : JSON.stringify(data);
            this.debuglog('%d\t%s\t%s', ts, tags.join(','), data);
        });

        // Add methods for each logging level.
        for (let level of LEVELS) {
            this[level] = function (tags, ...rest) {
                // Automatically insert current level into tags array.
                tags = tags || [];
                tags = Array.isArray(tags) ? tags : [ tags ];
                this._log([level, ...tags], ...rest);
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
        tags = tags || [];
        tags = Array.isArray(tags) ? tags : [ tags ];
        this._log(tags, data);
    }

    _log(tags, data) {
        this.emit('log', {
            source: this.name,
            ts: Date.now(),
            tags: tags,
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
        return root ? Path.dirname(root) : undefined;
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