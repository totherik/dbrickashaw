import Fs from 'fs';
import Path from 'path';


export default class Common {

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