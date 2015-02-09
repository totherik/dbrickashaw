dbrickashaw
===========

`dbrickashaw`, or `dshaw` for short, is a module for communicating logging
information to module consumers without dictating the mechanism by which they
log. This is intended for use by module authors to both capture logged data and
provide it to consumers. This module also supports composition of module logging
via an exported emitter, referred to below as the `Publisher`.

## Concepts

### Logger
The `logger` is the mechanism by which a module communicates data, such as
debugging information, etc. for observation. When authoring a module using
`dbrickashaw`, everywhere you want to communicate runtime data you would use a
`dbrickashaw` logger. You'll most likely want to create these loggers once at
initialization time and use throughout your code at execution time.

For example:

```javascript
// themodule.js
import Dbrickashaw from 'dbrickashaw';

let log = Dbrickashaw.createLogger(/* optional name*/);

export function doMyJob() {
	log.debug('atag', 'My message.');
}
```

### Publisher
As a module author, you also want to make this data available to consumers of
your module without being overly prescriptive as to what they choose to do with
the data. This is where the `Publisher` comes in. The Publisher is simply an
EventEmitter that will emit the aggregate of all of 'log' invocations through
a given module. Simply export the `dbrickashaw` publisher as `publisher` (or
some other obvious name), such that consumers of your code can observe any
logging information your module may produce.
```javascript
// producer.js
import Dbrickashaw from 'dbrickashaw';

export const publisher = Dbrickashaw.getPublisher();
```

```javascript
// consumer.js
import producer from 'producer';

producer.publisher.on('log', ({ source, ts, tags, data }) => {
	// Write the information to the logging appender/mechanism the consumer chooses.
});
```

Furthermore, if you as a module author choose to expose your logging data as
well as the logging data of modules you consume that may use `dbrickashaw`, you
can simply compose and expose publishers.

```javascript
// consumer_and_producer.js
import producer from 'producer';
import Dbrickashaw from 'dbrickashaw';

export const publisher = Dbrickashaw.getPublisher().observe(producer);
```

# API

##### `Dbrickashaw.decorate(module)`
Decorate the current module with the `publisher` property such that it can be
observed by dependents.
- `module` (Object) - The `module` pseudo-global variable. It should be the
module object for the "main" file and/or the API that is exported by the npm
module. Otherwise, it can be any object that has a property named `exports`
which has a mutable object for a value, e.g. `{ exports: {} }`.

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
event as an array of of strings. NOTE: If no additional tags are desired, pass a
falsy value, such as `null` in the first position.
- `data` The data payload to be logged. Emitter on the log event as `data`.

NOTE: In addition to the generic log method, the following methods are also
available: `silly`, `debug`, `verbose`, `info`, `warn`, and `error`. Each of
these methods behave identically to `log` except they automatically include a
tag for their given level.


## Publisher
##### `Dbrickashaw.getPublisher()`
Get the publisher for the current module. A Publisher is merely an EventEmitter.

### Methods
##### `observe(emitter || { publisher = Emitter })`
Start observing the provided emitter with the current publisher. This emitter's
`log` events will be proxied through this Publisher.
- `emitter` (EventEmitter or object with a `publisher` property to which an
EventEmitter is assigned.) This is the object whose `log` events will be
observed and relayed to subscribers.

##### `unobserve(emitter || { publisher = Emitter })`
Removes the provided emitter from observation by the Publisher.
- `emitter` (EventEmitter or object with a `publisher` property to which an
EventEmitter is assigned.) This is the object whose `log` events will be
observed and relayed to subscribers.

##### `filter(predicate)`
Returns a *new* publisher which will only emit events that fulfill the provided
predicate. This can be useful for branching events based on metadata such as tags.
- `predicate` A function that accepts a log event data object as its only
argument and returns true or false.

##### `clear()`
Removes all emitters from observation by the Publisher.

### Events
##### `'log'`
The event emitter when a downstream logger logs. The provided data has the
following properties:
- `source` - The name of the logger that logged the event.
- `tags` - An array of strings. Additionally, each tag is a property such that
a tag's existence can be tested for via `if (tags.info) { /* ... */ }` (as
opposed to searching the array).
- `ts` - The time, in milliseconds, when the logging occurred.
- `data` - Arbitrary data that was provided when invoking the log method.

```javascript
// example.js
publisher.on('log', ({ source, tags, ts, data }) => {
	console.log(source, data);
});
```

## Basic Examples
#### Producer
```javascript
// mymodule/index.js (or wherever your exported module API resides)
import Dbrickashaw from 'dbrickashaw'
import mycode from './mycode.js';

export const publisher = Dbrickashaw.getPublisher();
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


#### Consumer
```javascript
// consumer.js
import mymodule from 'mymodule'

mymodule.publisher.on('log', ({ source, ts, tags, data }) => {
	console.log(source, data);
});


themodule.doThings();
```


#### Producer and Consumer
```javascript
// producer_and_consumer.js
import mymodule from 'mymodule'
import Dbrickashaw from 'dbrickashaw';

export const publisher = Dbrickashaw.getPublisher().observe(mymodule);

mymodule.doThings();
```
