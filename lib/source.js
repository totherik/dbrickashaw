import Path from 'path';
import Common from './common';


export default class Source {
    constructor(name) {
        this.module = undefined;
        this.path = undefined;
        this.file = undefined;
        this.name = name;

        if (Common.isAbsolutePath(name)) {
            this._init(name);
        }
    }

    valueOf() {
        return this.toString();
    }

    toString() {
        return this.name;
    }

    _init(path) {
        // Derive a logger name from module name and path relative to module root.
        // e.g. "dbrickashaw:index.js" If a name can't be derived, default to
        // absolute path to file.
        let pkg = Common.findFile(path, 'package.json');
        if (pkg) {
            this.module = require(pkg).name;
            this.path = Path.dirname(pkg);
            this.file = path;
            this.name = this.module + ':' + Path.relative(this.path, this.file);
        }
    }

}