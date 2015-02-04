dbrickashaw
===========

#### Basic Usage
```javascript
// index.js (module API)
import { relay as logger } from 'dbrickashaw'

export const logger = logger;
 ```

 ```javascript
// mycode.js
import Dbrickashaw from 'dbrickashaw';

let logger = Dbrickashaw.createLogger();

export function foo() {
	 logger.log('info', 'Foo called.');
}
 ```