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
    }

}