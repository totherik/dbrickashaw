import Path from 'path';
import caller from 'caller';
import debuglog from 'debuglog';
import { EventEmitter } from 'events';
import Common from './common';


const LEVELS = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];

export default class Logger extends EventEmitter {

    constructor(name = caller()) {
        EventEmitter.call(this);

        this.source = Common.createSource(name);
        this.debuglog = debuglog(this.name);

        // register debuglog as a default log handler. Is opt-in by default,
        // so is a noop unless NODE_DEBUG is enabled for a particular name.
        this.on('log', ({ ts, tags, data }) => {
            if (data instanceof Error) {
                data = data.stack;
            }

            if (typeof data !== 'string') {
                data = JSON.stringify(data);
            }

            this.debuglog('%s %s', tags.join(','), data);
        });

        // Add methods for each logging level.
        for (let level of LEVELS) {
            this[level] = function () {
                this._log(...arguments, level);
            };
        }
    }

    get name() {
        return this.source.toString();
    }

    log() {
        this._log(...arguments);
    }

    _log(tags, data, level) {
        tags = tags || [];
        tags = Array.isArray(tags) ? tags : [ String(tags) ];

        if (level) {
            tags.push(String(level));
        }

        // Borrowed from hapi. Make the tags properties
        // in addition to an array of strings such that
        // consumers can just write `tags.error` instead
        // of `tags.indexOf('error') > -1`
        for (let tag of tags) {
            // Well we don't want to overwrite built-in/existing
            // properties, now do we?
            if (!(tag in tags)) {
                Object.defineProperty(tags, tag, {
                    value: true
                });
            }
        }

        this.emit('log', {
            source: this.source,
            ts: Date.now(),
            tags,
            data
        });
    }
}