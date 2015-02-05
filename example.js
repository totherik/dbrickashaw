import Dbrickashaw from './dist/index';

// This would be part of the published Module API.
export const logger = Dbrickashaw.getRelay();
logger.on('log', function ({ source, ts, tags, data }) {
    console.log(source, tags, ts, data);
});


// This would be used throughout your project.
let log = Dbrickashaw.createLogger();
log.info(['bar', 'foo'], { bar: 'bar'});
