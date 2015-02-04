dbrickashaw
===========

#### Basic Usage
```javascript
// index.js
import { Relay } from 'dbrickashaw'

export let logger = new Relay();
 ```

 ```
 // mycode.js
 import Dbrickashaw from 'dbrickashaw';

 let logger = new Dbrickashaw(); // or Dbrickashaw.createLogger();

 logger.log('mytag', 'My data.');
 ```