import test from 'tape'
import Path from 'path';
import Common from '../dist/lib/common.js';


test('Common', function (t) {

    let cases = [
        ['/usr/local/bin', true],
        ['../gif/spacer.gif', false],
        ['./utils.js', false],
        ['../images/../images/spacer.gif', false],
        [__dirname, true],
        [__filename, true]
    ];

    t.test('isAbsolutePath', t => {
        let actual;

        for (let [ path, expected ] of cases) {
            actual = Common.isAbsolutePath(path);
            t.equal(actual, expected);
        }

        t.end();
    });

});


test('Common', t => {

    let cases = [
        [
            __dirname,
            Path.dirname(__dirname)
        ],
        [
            __filename,
            Path.dirname(__dirname)
        ],
        [
            Path.join(__dirname, '..', 'node_modules', 'tape', 'node_modules'),
            Path.join(__dirname, '..', 'node_modules', 'tape')
        ]
    ];


    t.test('findFile', t => {
        let actual;

        for (let [ dir, expected ] of cases) {
            actual = Common.findModuleRoot(dir);
            t.equal(actual, expected);
        }

        t.end();
    });

});


test('Common', t => {

    let cases = [
        [
            __dirname,
            'package.json',
            Path.join(Path.dirname(__dirname), 'package.json')
        ],
        [
            Path.join(__dirname, '..', 'node_modules', 'tape', 'node_modules'),
            'package.json',
            Path.join(__dirname, '..', 'node_modules', 'tape', 'package.json')
        ],
        [
            __dirname,
            Path.basename(__filename),
            __filename
        ]
    ];


    t.test('findFile', function (t) {
        let actual;

        for (let [ dir, file, expected ] of cases) {
            actual = Common.findFile(dir, file);
            t.equal(actual, expected);
        }

        t.end();
    });

});