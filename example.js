import Dbrickashaw from './dist/index';

// This would be part of the published Module API.
export const relay = Dbrickashaw.getRelay();
relay.on('log', function ({ source, ts, tags, data }) {
    console.log(source, tags, ts, data);
});


// This would be used throughout your project.
let logger = Dbrickashaw.createLogger();
logger.log('foo', { bar: 'bar'});