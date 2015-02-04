dbrickashaw
===========

`dbrickashaw` is a module for communicating logging information to module consumers without dictating the mechanism
by which they log. This is intended for use by module owners to both capture logged data and provide it to consumers.

This module also supports composition of module logging via the exported logger/Relay.

#### Concepts

##### Logger
The `logger` is the mechanism by which a module communicates data, such as debugging information, etc. for observation.
When authoring a module using `dbrickashaw`, everywhere you want to communicate runtime data you would use a
`dbrickashaw` logger. You'll most likely want to create these loggers once at initialization time and use throughout
your code at execution time.

For example:

```javascript
// themodule.js
import Dbrickashaw from 'dbrickashaw';

let log = Dbrickashaw.createLogger(/* optional name*/);

export const logger = Dbrickashaw.getRelay();

export function doMyJob() {
	log.debug('atag', 'My message.');
}
```

##### Relay
As a module author, you also want to make this data available to consumers of your module without being overly
prescriptive as to what they choose to do with the data. This is where the `Relay` comes in. Simply export the
`dbrickashaw` relay as `logger` or some other obvious name, such that consumers of your code can observe any
logging information your module may produce.
```javascript
// producer.js

```javascript
// consumer.js
import themodule from 'themodule';

themodule.logger.on('log', ({ source, ts, tags, data }) => {
	// Write the information to the logging appender/mechanism you choose.
});
```

Furthermore, if you as a module author choose to expose your logging data as well as the logging data of modules you
consume that may use `dbrickashaw`, you can simply compose and expose relays.

```javascript
// consumer.js
import themodule from 'themodule';
import Dbrickashaw from 'dbrickashaw';

export const logger = Dbrickashaw.getRelay().register(themodule);
```

#### API
...

#### Basic Usage
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


```javascript
// consumer.js
import { logger, doThings } from 'mymodule'

mymodule.logger.on('log', ({ source, ts, tags, data }) => {
	console.log(source, data);
});


doThings();
```
