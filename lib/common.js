import Fs from 'fs';
import Path from 'path';


export default {

    isAbsolutePath(path) {
        path = Path.normalize(path);
        return path === Path.resolve(path);
    },

    findModuleRoot(dir) {
        let root = this.findFile(dir, 'package.json');
        return root ? Path.dirname(root) : undefined;
    },

    findFile(dir, file) {
        let path = Path.join(dir, file);
        if (Fs.existsSync(path)) {
            return path;
        }

        let parent = Path.dirname(dir);
        if (parent === dir || parent === '/') {
            return undefined;
        }

        return this.findFile(parent, file);
    },

    createSource(name) {
        let source = {
            module: undefined,
            path: undefined,
            file: undefined,
            valueOf() {
                return this.toString();
            },
            toString() {
                return name;
            }
        };

        if (this.isAbsolutePath(name)) {
            // Derive a logger name from module name and path relative to module root.
            // e.g. "dbrickashaw:index.js" If a name can't be derived, default to
            // absolute path to file.
            let pkg = this.findFile(name, 'package.json');
            if (pkg) {
                source.module = require(pkg).name;
                source.path = Path.dirname(pkg);
                source.file = name;
                source.toString = function () {
                    return this.module + ':' + Path.relative(this.path, this.file);
                };
            }
        }
        return source;
    }

}