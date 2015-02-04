dbrickashaw
===========

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
