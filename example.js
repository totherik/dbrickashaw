import Dbrickashaw from './dist/index';

// This would be part of the published Module API.
export const publisher = Dbrickashaw.getPublisher();
publisher.on('log', function ({ source, ts, tags, data }) {
    console.log('', ts, source, tags.join(','), data);
});


//C onsumers can also filter events...
let errors = publisher.filter(({ tags }) => tags.error );
errors.on('log', function ({ source, ts, tags, data }) {
    if (data instanceof Error) {
        data = data.stack;
    }
    console.log('', ts, source, tags.join(','), 'WHOA!!', data);
});


// This would be used throughout your project.
let logger = Dbrickashaw.createLogger();
logger.log('bar', 'foo');
logger.info(['bar', 'foo'], { bar: 'bar'});
logger.error(null, new Error('FAILURE'));