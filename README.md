dbrickashaw
===========

#### Basic Usage
```javascript
// mymodule (index.js, or wherever your exported module API resides)
import { relay as logger } from 'dbrickashaw'
import mycode from './mycode.js';

export const logger = logger;
export function doThings() {
	mycode.run();
}
```

```javascript
// mycode.js (or any file in your module, really.)
import Dbrickashaw from 'dbrickashaw';

let logger = new Dbrickashaw();

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
