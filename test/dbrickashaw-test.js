import test from 'tape'
import Path from 'path';
import Dbrickashaw from '../dist/index';

test('Dbrickashaw', function (t) {

    let reset = () => {
        let publisher = Dbrickashaw.getPublisher();
        publisher.clear();
        publisher.removeAllListeners();
    };

    t.test('clear', t => {
        t.plan(2);

        let publisher = Dbrickashaw.getPublisher();
        publisher.on('log', ({ source, data }) => {
            t.equal(String(source), 'clear');
            t.equal(data, 'foo');
        });

        let logger = Dbrickashaw.createLogger('clear');
        logger.log(null, 'foo'); // Should trigger
        publisher.clear();
        logger.log(null, 'foo'); // Should not trigger

        reset();
        t.end();
    });


    t.test('event data', t => {
        t.plan(8);

        let name = 'data';
        let tag = 'error';
        let message = 'This is an error';
        let logger = Dbrickashaw.createLogger(name);

        t.ok(logger);
        t.equal(logger.name, name);

        logger.on('log', ({ source, ts, tags, data }) => {
            t.equal(String(source), name);

            t.ok(typeof ts === 'number');
            t.ok(ts <= Date.now());

            t.ok(Array.isArray(tags));
            t.equal(tags[0], tag);

            t.equal(data, message);
        });

        logger.log(tag, message);
        reset();
        t.end();
    });

    t.test('generated name', t => {
        t.plan(2);

        let pkg = require('../package.json');
        let name = pkg.name + '@' + pkg.version + ':' + Path.join(Path.basename(__dirname), Path.basename(__filename));
        let logger = Dbrickashaw.createLogger();
        t.ok(logger);
        t.equal(logger.name, name);

        reset();
        t.end();
    });


    t.test('custom name', t => {
        t.plan(2);

        let name = 'test_name';
        let logger = Dbrickashaw.createLogger(name);
        t.ok(logger);
        t.equal(logger.name, name);

        reset();
        t.end();
    });

    t.test('exposed publisher', t => {
        t.plan(7);

        let name = 'test_global';
        let logger = Dbrickashaw.createLogger(name);
        t.ok(logger);
        t.equal(logger.name, name);
        t.ok(Dbrickashaw.getPublisherAggregate());
        t.ok(Dbrickashaw.getPublisherAggregate().test_global);
        t.ok(global.__dbrickashaw);
        t.ok(global.__dbrickashaw.test_global);

        Dbrickashaw.getPublisher().unobserve(logger);
        
        t.ok(!global.__dbrickashaw.test_global);

        reset();
        t.end();
    });


    t.test('error', t => {
        t.plan(14);

        let logger = Dbrickashaw.createLogger();

        logger.on('log', ({ source, ts, tags, data }) => {
            t.ok(source);
            t.ok(ts);

            t.ok(Array.isArray(tags));

            // Ensure array contains requires tags
            t.ok(tags.indexOf('foo') !== -1);
            t.ok(tags.indexOf('error') !== -1);
            t.ok(tags.indexOf('length') !== -1);
            t.ok(tags.indexOf('indexOf') !== -1);

            // Ensure object has appropriate tags as properties
            // but tags do not override existing props.
            t.ok(tags.foo);
            t.ok(tags.error);
            t.notOk(tags.info);
            t.equal(tags.length, 4);
            t.equal(typeof tags.length, 'number');
            t.equal(typeof tags.indexOf, 'function');

            t.equal(data, 'bar');
        });

        logger.error(['foo', 'length', 'indexOf'], 'bar');

        reset();
        t.end();
    });


    t.test('filter', t => {
        t.plan(10);

        let name = 'filter';
        let publisher = Dbrickashaw.getPublisher();
        let filtered = publisher.filter(({ tags }) => tags.error);
        let event = 0;

        publisher.on('log', ({ source, ts, tags, data }) => {
            event += 1;

            if (event === 1) {
                t.equal(String(source), name);
                t.ok(tags.info);
                t.equal(data, 'foo');
                return;
            }

            t.equal(String(source), name);
            t.ok(tags.error);
            t.equal(data, 'bar');
        });

        filtered.on('log', ({ source, ts, tags, data }) => {
            t.equal(String(source), name);
            t.notOk(tags.info);
            t.ok(tags.error);
            t.equal(data, 'bar');
            filtered.clear();
        });

        let logger = Dbrickashaw.createLogger(name);
        logger.info(null, 'foo');
        logger.error(null, 'bar');

        reset();
        t.end();
    });

});
