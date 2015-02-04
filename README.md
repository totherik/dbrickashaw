dbrickashaw
===========

#### Basic Usage
```javascript
// index.js (module API)
import { Relay } from 'dbrickashaw'

export let logger = new Relay(); // or Relay.create();
 ```

 ```javascript
// mycode.js
import Dbrickashaw from 'dbrickashaw';

let logger = new Dbrickashaw(); // or Dbrickashaw.createLogger();

export let function foo() {
	 logger.log('info', 'Foo called.');
}
 ```