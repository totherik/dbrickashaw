import Fs from 'fs';
import Path from 'path';
import caller from 'caller';
import debuglog from 'debuglog';
import { EventEmitter } from 'events';


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

        Dbrickashaw.getRelay().register(this);
    }

    static getRelay() {
        return Dbrickashaw.relay || (Dbrickashaw.relay = Relay.create());
    }

    static createLogger() {
        return new Dbrickashaw(...arguments);
    }

    log(tags, data) {
        this.emit('log', {
            source: this.name,
            ts: Date.now(),
            tags: Array.isArray(tags) ? tags : [ tags ],
            data
        });
    }

    error(tags, ...rest) {
        tags = Array.isArray(tags) ? tags : [ tags ];
        this.log(['error', ...tags], ...rest);
    }

}


export class Relay extends EventEmitter {
    constructor() {
        EventEmitter.call(this);
        this.emitters = null;
        this.clear();
    }

    static create() {
        return new Relay();
    }

    register(emitter) {
        if (!this.emitters.has(emitter)) {
            let handler = () => {
                this.emit('log', ...arguments);
            };

            this.emitters.set(emitter, handler);
            emitter.on('log', handler);
        }
    }

    unregister(emitter) {
        if (this.emitters.has(emitter)) {
            let handler = this.emitters.get(emitter);
            emitter.removeListener('log', handler);
            this.emitters.delete(emitter);
        }
    }

    clear() {
        this.emitters = new WeakMap();
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