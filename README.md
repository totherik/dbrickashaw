dbrickashaw
===========

#### Basic Usage
```javascript
// index.js (module API)
import { Relay } from 'dbrickashaw'

export let logger = Relay.create();
 ```

 ```javascript
// mycode.js
import Dbrickashaw from 'dbrickashaw';

let logger = Dbrickashaw.createLogger();

export let function foo() {
	 logger.log('info', 'Foo called.');
}
 ```