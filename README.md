dbrickashaw
===========

`dbrickashaw` is a module for communicating logging information to module consumers without dictating the mechanism
by which they log. This is intended for use by module authors to both capture logged data and provide it to consumers.

This module also supports composition of module logging via the exported logger/Relay.

## Concepts

### Logger
The `logger` is the mechanism by which a module communicates data, such as debugging information, etc. for observation.
When authoring a module using `dbrickashaw`, everywhere you want to communicate runtime data you would use a
`dbrickashaw` logger. You'll most likely want to create these loggers once at initialization time and use throughout
your code at execution time.

For example:

```javascript
// themodule.js
import Dbrickashaw from 'dbrickashaw';

let log = Dbrickashaw.createLogger(/* optional name*/);

export function doMyJob() {
	log.debug('atag', 'My message.');
}
```

### Relay
As a module author, you also want to make this data available to consumers of your module without being overly
prescriptive as to what they choose to do with the data. This is where the `Relay` comes in. Simply export the
`dbrickashaw` relay as `logger` or some other obvious name, such that consumers of your code can observe any
logging information your module may produce.
```javascript
// producer.js
import Dbrickashaw from 'dbrickashaw';

export const logger = Dbrickashaw.getRelay();
```

```javascript
// consumer.js
import producer from 'producer';

producer.logger.on('log', ({ source, ts, tags, data }) => {
	// Write the information to the logging appender/mechanism the consumer chooses.
});
```

Furthermore, if you as a module author choose to expose your logging data as well as the logging data of modules you
consume that may use `dbrickashaw`, you can simply compose and expose relays.

```javascript
// consumer_and_producer.js
import producer from 'producer';
import Dbrickashaw from 'dbrickashaw';

export const logger = Dbrickashaw.getRelay().register(producer);
```

# API

## Logger
##### `Dbrickashaw.createLogger([name])`
Create an instance of logger for use in a module file.
- `name` (Optional, string) - This value becomes the `source` attribute on log
events. If not provided, defaults the module name and relative file path of the
current file, relative to the module root (module root being the closest parent
directory containing a `package.json` file), so for example: `mymodule:lib/myfile.js`.

### Methods
##### `log(tags, data)`

- `tags` (String or array of strings) - These tags are always emitted on the log
event as an array of of strings.
- `data` The data payload to be logged. Emitter on the log event as `data`.

NOTE: In addition to the generic log method, the following methods are also available:
`silly`, `debug`, `verbose`, `info`, `warn`, and `error`. Each of these methods
behave identically to `log` except they automatically include a tag for their
given level.


## Relay
##### `Dbrickashaw.getRelay()`
Get the relay for the current module.

### Methods
##### `register(emitter | { logger = Emitter })`
Register the provided emitter with the current relay. This emitter's `log`
events will by proxied through this Relay.
- `emitter` (EventEmitter or object with a `logger` property to which an
Event Emitter is assigned.) This is the object whose `log` events will be
observed and relayed to Relay observers.

##### `unregister(emitter | { logger = Emitter })`
Removes the provided emitter from observation by the Relay.

##### `clear()`
Removes all emitters from observation by the Relay.


### Basic Usage - Producer
```javascript
// mymodule/index.js (or wherever your exported module API resides)
import Dbrickashaw from 'dbrickashaw'
import mycode from './mycode.js';

export const logger = Dbrickashaw.getRelay();
export function doThings() {
	mycode.run();
}
```

```javascript
// mymodule/mycode.js (or any file in your module, really.)
import Dbrickashaw from 'dbrickashaw';

let logger = Dbrickashaw.createLogger();

export function run() {
	 logger.log('info', 'Foo called.');
}
 ```


#### Basic Usage = Consumer
```javascript
// consumer.js
import themodule from 'themodule'

themodule.logger.on('log', ({ source, ts, tags, data }) => {
	console.log(source, data);
});


themodule.doThings();
```


#### Basic Usage - Producer and Consumer
```javascript
// producer_and_consumer.js
import themodule from 'themodule'
import Dbrickashaw from 'dbrickashaw';

export const logger = Dbrickashaw.getRelay().register(themodule);


themodule.doThings();

```
