import Path from 'path';
import caller from 'caller';
import debuglog from 'debuglog';
import { EventEmitter } from 'events';
import { isAbsolutePath, findFile } from './common';


const LEVELS = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];

export default class Logger extends EventEmitter {

    constructor(name = caller()) {
        EventEmitter.call(this);

        if (isAbsolutePath(name)) {
            // Derive a logger name from module name and path relative to module root.
            // e.g. "dbrickashaw:index.js" If a name can't be derived, default to
            // absolute path to file.
            let pkg = findFile(name, 'package.json');
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