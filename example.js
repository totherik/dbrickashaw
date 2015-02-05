import Dbrickashaw from './dist/index';

// This would be part of the published Module API.
export const publisher = Dbrickashaw.getPublisher();
publisher.on('log', function ({ source, ts, tags, data }) {
    console.log(source, tags, ts, data);
});


// This would be used throughout your project.
let logger = Dbrickashaw.createLogger();
logger.log('bar', 'foo');
logger.info(['bar', 'foo'], { bar: 'bar'});
