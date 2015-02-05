import test from 'tape'
import Path from 'path';
import Dbrickashaw from '../dist/index';


test('Dbrickashaw', function (t) {

    t.test('instance', t => {
        let name = 'dbrickashaw:' + Path.join(Path.basename(__dirname), Path.basename(__filename));
        let logger = Dbrickashaw.createLogger();
        t.ok(logger);
        t.equal(logger.name, name);
        t.end();
    });


    t.test('custom name', t => {
        let name = 'test_name';
        let tag = 'error';
        let message = 'This is an error';

        let logger = Dbrickashaw.createLogger(name);
        t.ok(logger);
        t.equal(logger.name, name);

        logger.on('log', ({ source, ts, tags, data }) => {
            t.equal(source, name);

            t.ok(typeof ts === 'number');
            t.ok(ts <= Date.now());

            t.ok(Array.isArray(tags));
            t.equal(tags[0], tag);

            t.equal(data, message);

            t.end();
        });

        logger.log(tag, message);
    });


    t.test('error', t => {
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
            t.end();
        });

        logger.error(['foo', 'length', 'indexOf'], 'bar');
    });


    t.test('filter', t => {
        let name = 'filter';

        let publisher = Dbrickashaw.getPublisher();
        let filtered = publisher.filter(function (event) {
            return event.error;
        });

        let event = 0;
        publisher.on('log', ({ source, ts, tags, data }) => {
            event += 1;

            t.equal(source, name);

            if (event === 1) {
                t.ok(tags.info);
                t.equal(data, 'foo');
                return;
            }

            t.ok(tags.error);
            t.equal(data, 'bar');
        });

        filtered.on('log', ({ source, ts, tags, data }) => {
            t.equal(source, name);
            t.notOk(tags.info);
            t.ok(tags.error);
            t.equal(data, 'bar');
        });

        let logger = Dbrickashaw.createLogger(name);
        logger.info(null, 'foo');
        logger.error(null, 'bar');
        t.end();
    });
    
});