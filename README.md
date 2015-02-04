dbrickashaw
===========

#### Basic Usage
```javascript
// index.js (module API)
import { Relay } from 'dbrickashaw'

export const logger = Relay.create();
 ```

 ```javascript
// mycode.js
import Dbrickashaw from 'dbrickashaw';

let logger = Dbrickashaw.createLogger();

export function foo() {
	 logger.log('info', 'Foo called.');
}
 ```